import { BadRequestException } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { multerMemoryOptions } from '../../common/multer-memory.config';
import type { CompanyProjectsService } from './company-projects.service';
import type { UploadLaunchAndTrainingDto } from './dto/upload-launch-and-training.dto';

/** Multipart field names accepted for Launch & Training session uploads (admin + company URL aliases). */
export type LaunchTrainingSessionFiles = {
  launch_session_file?: Express.Multer.File[];
  file?: Express.Multer.File[];
  document?: Express.Multer.File[];
  document_file?: Express.Multer.File[];
  upload?: Express.Multer.File[];
  launch_upload?: Express.Multer.File[];
};

export function launchTrainingSessionUploadInterceptor() {
  return FileFieldsInterceptor(
    [
      { name: 'launch_session_file', maxCount: 1 },
      { name: 'file', maxCount: 1 },
      { name: 'document', maxCount: 1 },
      { name: 'document_file', maxCount: 1 },
      { name: 'upload', maxCount: 1 },
      { name: 'launch_upload', maxCount: 1 },
    ],
    {
      ...multerMemoryOptions,
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        const ok = [
          'application/pdf',
          'image/png',
          'image/jpeg',
          'image/jpg',
          'image/webp',
        ].includes(file.mimetype);
        if (ok) cb(null, true);
        else cb(new BadRequestException('Only PDF or image files are allowed.'), false);
      },
    },
  );
}

export function addLaunchTrainingSessionFromMultipart(
  companyProjectsService: CompanyProjectsService,
  projectId: string,
  dto: UploadLaunchAndTrainingDto,
  files?: LaunchTrainingSessionFiles,
) {
  const file =
    files?.launch_session_file?.[0] ||
    files?.file?.[0] ||
    files?.document?.[0] ||
    files?.document_file?.[0] ||
    files?.upload?.[0] ||
    files?.launch_upload?.[0];
  if (!file) {
    throw new BadRequestException({
      status: 'error',
      message:
        'No file uploaded. Use multipart field launch_session_file, file, document, document_file, upload, or launch_upload (PDF or image, max 10MB).',
    });
  }
  return companyProjectsService.addLaunchTrainingSessionForAdmin(
    projectId,
    file,
    dto.session_date || dto.launch_training_report_date,
  );
}
