import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFiles,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CompanyProjectsService } from './company-projects.service';
import { UploadLaunchAndTrainingDto } from './dto/upload-launch-and-training.dto';
import {
  LaunchTrainingSessionFiles,
  addLaunchTrainingSessionFromMultipart,
  launchTrainingSessionUploadInterceptor,
} from './launch-training-session-upload.config';

/**
 * Admin Launch & Training — GET + POST under one controller prefix.
 *
 * Base paths: `/api/admin/projects` and `/admin/projects` (legacy).
 * Primary-data GET aliases live here so they share the same prefix as launch-training routes.
 *
 * Company API aliases live on `CompanyProjectsController` (`/api/company/projects/.../launch-training`).
 */
@Controller(['api/admin/projects', 'admin/projects'])
export class AdminLaunchTrainingController {
  constructor(private readonly companyProjectsService: CompanyProjectsService) {}

  /**
   * Primary data (admin / facilitator UIs often call these under `/api/admin/projects/...`).
   * Registered here on the `api/admin/projects` controller prefix so routing matches launch-training.
   */
  @Get(':projectId/primary-data')
  async getPrimaryDataForAdmin(@Param('projectId') projectId: string): Promise<any> {
    return this.companyProjectsService.getPrimaryDataForAdmin(projectId);
  }

  @Get(':projectId/primary-data/review')
  async getPrimaryDataReviewForAdmin(@Param('projectId') projectId: string): Promise<any> {
    return this.companyProjectsService.getPrimaryDataForApproval(projectId);
  }

  @Get(':projectId/launch-training')
  async getLaunchTraining(@Param('projectId') projectId: string): Promise<any> {
    return this.companyProjectsService.getLaunchTrainingProgramForAdmin(projectId);
  }

  @Get(':projectId/launch-training-program')
  async getLaunchTrainingProgram(@Param('projectId') projectId: string): Promise<any> {
    return this.companyProjectsService.getLaunchTrainingProgramForAdmin(projectId);
  }

  @Post(':projectId/launch-training-sessions')
  @UseInterceptors(launchTrainingSessionUploadInterceptor())
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async postLaunchTrainingSessions(
    @Param('projectId') projectId: string,
    @Body() dto: UploadLaunchAndTrainingDto,
    @UploadedFiles() files?: LaunchTrainingSessionFiles,
  ): Promise<any> {
    return addLaunchTrainingSessionFromMultipart(
      this.companyProjectsService,
      projectId,
      dto,
      files,
    );
  }

  @Post(':projectId/launch-training')
  @UseInterceptors(launchTrainingSessionUploadInterceptor())
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async postLaunchTraining(
    @Param('projectId') projectId: string,
    @Body() dto: UploadLaunchAndTrainingDto,
    @UploadedFiles() files?: LaunchTrainingSessionFiles,
  ): Promise<any> {
    return addLaunchTrainingSessionFromMultipart(
      this.companyProjectsService,
      projectId,
      dto,
      files,
    );
  }
}
