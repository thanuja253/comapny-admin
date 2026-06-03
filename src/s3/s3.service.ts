import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as fs from 'fs';
import type { Readable } from 'stream';

@Injectable()
export class S3Service {
  private readonly s3Client: S3Client;
  private readonly bucket: string;
  private readonly cloudfrontBase: string;

  constructor(private readonly configService: ConfigService) {
    this.bucket = this.configService.get<string>('AWS_S3_BUCKET') || '';
    const cloudfront = (this.configService.get<string>('AWS_CLOUDFRONT_URL') || '').trim();
    this.cloudfrontBase = cloudfront.replace(/\/+$/, '');

    this.s3Client = new S3Client({
      region: this.configService.get<string>('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID') || '',
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY') || '',
      },
    });
  }

  /** Stored value may be a raw S3 key or a CloudFront / S3 HTTPS URL. */
  extractKey(stored: string | undefined | null): string | null {
    const raw = String(stored || '').trim();
    if (!raw) return null;
    if (!raw.startsWith('http')) {
      return raw.replace(/^\/+/, '');
    }
    if (this.cloudfrontBase && raw.startsWith(this.cloudfrontBase)) {
      return raw.slice(this.cloudfrontBase.length).replace(/^\/+/, '') || null;
    }
    try {
      const u = new URL(raw);
      return u.pathname.replace(/^\/+/, '') || null;
    } catch {
      return null;
    }
  }

  getPublicUrl(key: string): string {
    const normalizedKey = String(key || '').replace(/^\/+/, '');
    if (this.cloudfrontBase) {
      return `${this.cloudfrontBase}/${normalizedKey}`;
    }
    return `https://${this.bucket}.s3.amazonaws.com/${normalizedKey}`;
  }

  async uploadFile(
    file: Express.Multer.File,
    folder = 'uploads',
  ): Promise<string> {
    let buffer = file.buffer;
    if (!buffer?.length && file.path && fs.existsSync(file.path)) {
      buffer = fs.readFileSync(file.path);
    }
    if (!buffer?.length) {
      buffer = Buffer.alloc(0);
    }
    return this.uploadBuffer(buffer, file.originalname, folder, file.mimetype);
  }

  async uploadBuffer(
    buffer: Buffer,
    originalName: string,
    folder = 'uploads',
    contentType?: string,
  ): Promise<string> {
    const safeName = String(originalName || 'file').replace(/[^\w.\-]+/g, '_');
    const key = `${folder.replace(/\/+$/, '')}/${Date.now()}-${safeName}`;

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType || 'application/octet-stream',
      }),
    );

    return key;
  }

  async copyObject(sourceKey: string, destFolder: string): Promise<string | null> {
    const src = this.extractKey(sourceKey);
    if (!src) return null;
    const stream = await this.getObjectStream(src);
    if (!stream) return null;
    const chunks: Buffer[] = [];
    await new Promise<void>((resolve, reject) => {
      stream.on('data', (c: Buffer) => chunks.push(c));
      stream.on('error', reject);
      stream.on('end', resolve);
    });
    const buffer = Buffer.concat(chunks);
    const filename = src.split('/').pop() || 'file';
    return this.uploadBuffer(buffer, filename, destFolder);
  }

  async deleteFile(key: string) {
    const normalized = this.extractKey(key) || key;
    await this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: normalized,
      }),
    );

    return {
      message: 'File deleted successfully',
    };
  }

  async getSignedDownloadUrl(key: string) {
    const normalized = this.extractKey(key) || key;
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: normalized,
    });

    return getSignedUrl(this.s3Client, command, {
      expiresIn: 3600,
    });
  }

  async getObjectStream(key: string): Promise<Readable | null> {
    const normalized = this.extractKey(key) || key;
    try {
      const out = await this.s3Client.send(
        new GetObjectCommand({
          Bucket: this.bucket,
          Key: normalized,
        }),
      );
      return (out.Body as Readable) || null;
    } catch {
      return null;
    }
  }

  async getSignedUploadUrl(
    fileName: string,
    contentType: string,
    folder = 'uploads',
  ) {
    const key = `${folder.replace(/\/+$/, '')}/${Date.now()}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });

    const url = await getSignedUrl(this.s3Client, command, {
      expiresIn: 3600,
    });

    return {
      key,
      url,
      publicUrl: this.getPublicUrl(key),
    };
  }

  async listFiles(prefix = '') {
    const result = await this.s3Client.send(
      new ListObjectsV2Command({
        Bucket: this.bucket,
        Prefix: prefix,
      }),
    );

    return result.Contents || [];
  }
}
