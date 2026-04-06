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
import { AssessorAuthService } from './assessor-auth.service';
import { AssessorLoginDto } from './dto/assessor-login.dto';
import { AssessorForgotPasswordDto } from './dto/assessor-forgot-password.dto';
import { AssessorChangePasswordDto } from './dto/assessor-change-password.dto';
import { AssessorJwtAuthGuard } from './guards/assessor-jwt-auth.guard';

@Controller('api/assessor/auth')
export class AssessorAuthController {
  constructor(private readonly assessorAuthService: AssessorAuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: AssessorLoginDto) {
    return this.assessorAuthService.login(dto);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() dto: AssessorForgotPasswordDto) {
    return this.assessorAuthService.forgotPassword(dto);
  }

  @Post('change-password')
  @UseGuards(AssessorJwtAuthGuard)
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        const errors: Record<string, string[]> = {};
        validationErrors.forEach((error) => {
          if (error.constraints) errors[error.property] = Object.values(error.constraints);
        });
        return new BadRequestException({
          status: 'error',
          message: 'Validation failed.',
          errors,
        });
      },
    }),
  )
  async changePassword(@Request() req, @Body() dto: AssessorChangePasswordDto) {
    return this.assessorAuthService.changePassword(req.user.userId, dto);
  }

  @Get('me')
  @UseGuards(AssessorJwtAuthGuard)
  async me(@Request() req) {
    return this.assessorAuthService.me(req.user.userId);
  }

  @Get('my-projects')
  @UseGuards(AssessorJwtAuthGuard)
  async myProjects(@Request() req) {
    return this.assessorAuthService.myProjects(req.user.userId);
  }
}
