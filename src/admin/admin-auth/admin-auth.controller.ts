import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { AdminAuthService } from './admin-auth.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { AdminForgotPasswordDto } from './dto/admin-forgot-password.dto';
import { AdminChangePasswordDto } from './dto/admin-change-password.dto';
import { AdminProfileDto } from './dto/admin-profile.dto';
import { AdminJwtAuthGuard } from './guards/admin-jwt-auth.guard';

@Controller(['api/admin', 'api/admin/auth'])
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: AdminLoginDto) {
    return this.adminAuthService.login(loginDto);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: AdminForgotPasswordDto) {
    return this.adminAuthService.forgotPassword(forgotPasswordDto);
  }

  @Post('change-password')
  @UseGuards(AdminJwtAuthGuard)
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        const errors: Record<string, string[]> = {};

        validationErrors.forEach((error) => {
          if (error.constraints) {
            errors[error.property] = Object.values(error.constraints);
          }
        });

        return new BadRequestException({
          status: 'error',
          message: 'Validation failed.',
          errors,
        });
      },
    }),
  )
  async changePassword(
    @Request() req,
    @Body() changePasswordDto: AdminChangePasswordDto,
  ) {
    return this.adminAuthService.changePassword(
      req.user.userId,
      changePasswordDto,
    );
  }

  @Get('me')
  @UseGuards(AdminJwtAuthGuard)
  async me(@Request() req) {
    return this.adminAuthService.me(req.user.userId);
  }

  @Post('profile')
  @UseGuards(AdminJwtAuthGuard)
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        const errors: Record<string, string[]> = {};
        validationErrors.forEach((error) => {
          if (error.constraints) {
            errors[error.property] = Object.values(error.constraints);
          }
        });
        return new BadRequestException({
          status: 'validations',
          errors,
        });
      },
    }),
  )
  async upsertProfile(@Request() req, @Body() dto: AdminProfileDto) {
    return this.adminAuthService.upsertProfile(req.user.userId, dto);
  }

  @Post('logout')
  @UseGuards(AdminJwtAuthGuard)
  async logout() {
    return {
      status: 'success',
      message: 'Thank you. You have been succesfully logged out',
    };
  }
}
