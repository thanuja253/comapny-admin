import { memoryStorage } from 'multer';

/** All multipart uploads buffer in memory then persist to S3 (no local disk). */
export const multerMemoryOptions = {
  storage: memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024,
  },
};

export const multerMemoryPdfOptions = {
  ...multerMemoryOptions,
  fileFilter: (
    _req: unknown,
    file: Express.Multer.File,
    cb: (error: Error | null, acceptFile?: boolean) => void,
  ) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
};
