import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'node:path';
import { existsSync, mkdirSync } from 'node:fs';
import { ValidationError } from 'class-validator';
import { AssessorManagementService } from './assessor-management.service';
import { CreateAssessorDto } from './dto/create-assessor.dto';
import { UpdateAssessorDto } from './dto/update-assessor.dto';

@Controller(['api/admin', 'admin'])
export class AssessorManagementController {
  constructor(private readonly service: AssessorManagementService) {}

  @Post('assessors')
  @HttpCode(HttpStatus.OK)
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
          status: 'validations',
          errors,
        });
      },
    }),
  )
  async create(@Body() dto: CreateAssessorDto) {
    return this.service.createAssessor(dto);
  }

  @Get('assessors_data')
  async list(@Query() query: Record<string, any>) {
    return this.service.listAssessors(query);
  }

  @Get('assessors/:id')
  @Header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  @Header('Pragma', 'no-cache')
  @Header('Expires', '0')
  async getById(@Param('id') id: string, @Query() query: Record<string, any>) {
    return this.service.getAssessorById(id, query);
  }

  @Put('assessors/:id')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    AnyFilesInterceptor({
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const uploadPath = 'uploads/assessors';
          if (!existsSync(uploadPath)) mkdirSync(uploadPath, { recursive: true });
          cb(null, uploadPath);
        },
        filename: (_req, file, cb) => {
          const suffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          const safeField = file.fieldname.replaceAll(/[^a-zA-Z0-9_-]/g, '');
          cb(null, `${safeField}-${suffix}${extname(file.originalname)}`);
        },
      }),
    }),
  )
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
          status: 'validations',
          errors,
        });
      },
    }),
  )
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAssessorDto,
    @UploadedFiles() files: Express.Multer.File[] = [],
  ) {
    return this.service.updateAssessorById(id, dto, files);
  }
}
