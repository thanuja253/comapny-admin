import { NotFoundException } from '@nestjs/common';
import type { Response } from 'express';
import { S3Service } from '../s3/s3.service';

export function uploadsRelativePathFromStored(stored: string): string | null {
  const trimmed = String(stored || '').trim();
  if (!trimmed) return null;
  const idx = trimmed.indexOf('/uploads/');
  if (idx >= 0) return trimmed.slice(idx + 1);
  if (trimmed.startsWith('uploads/')) return trimmed.replace(/^\/+/, '');
  return null;
}

/** Public URL for API responses (CloudFront/S3). */
export function resolvePublicUrl(
  s3: S3Service,
  stored: string | undefined | null,
  _baseUrl?: string,
): string | null {
  const raw = String(stored || '').trim();
  if (!raw) return null;
  if (raw.startsWith('http')) return raw;
  const key = s3.extractKey(raw);
  if (key) return s3.getPublicUrl(key);
  return s3.getPublicUrl(raw.replace(/^\/+/, ''));
}

export async function persistMulterFile(
  s3: S3Service,
  file: Express.Multer.File,
  folder: string,
): Promise<{ key: string; publicUrl: string }> {
  const key = await s3.uploadFile(file, folder);
  return { key, publicUrl: s3.getPublicUrl(key) };
}

export async function deleteStoredFile(s3: S3Service, stored: string | undefined | null): Promise<void> {
  const raw = String(stored || '').trim();
  if (!raw) return;
  const key = s3.extractKey(raw);
  if (!key) return;
  try {
    await s3.deleteFile(key);
  } catch {
    /* ignore */
  }
}

export async function streamStoredFileToResponse(
  s3: S3Service,
  res: Response,
  stored: string,
  filename: string,
  contentType: string,
): Promise<void> {
  const key = s3.extractKey(stored);
  if (!key) {
    throw new NotFoundException({ status: 'error', message: 'File not found' });
  }
  const stream = await s3.getObjectStream(key);
  if (!stream) {
    throw new NotFoundException({ status: 'error', message: 'File not found' });
  }
  res.setHeader('Content-Type', contentType);
  const safeName = String(filename).replace(/"/g, "'");
  res.setHeader('Content-Disposition', `inline; filename="${safeName}"`);
  stream.on('error', () => {
    if (!res.headersSent) {
      res.status(404).json({ status: 'error', message: 'File not found' });
    }
  });
  stream.pipe(res);
}
