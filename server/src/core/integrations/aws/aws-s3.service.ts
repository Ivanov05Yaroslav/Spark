import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as path from 'path';

@Injectable()
export class AwsS3Service {
  private readonly s3Client: S3Client;
  private readonly logger = new Logger(AwsS3Service.name);
  private readonly bucketName = process.env.AWS_S3_BUCKET_NAME || 'spark-school-system-bucket';

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION as string,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
      },
    });
  }

  async uploadFile(file: any, folder: string = 'materials'): Promise<string> {
    try {
      const ext = path.extname(file.originalname);
      const uniqueFilename = `${folder}/${randomUUID()}${ext}`;

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: uniqueFilename,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await this.s3Client.send(command);

      return `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${uniqueFilename}`;
    } catch (error) {
      this.logger.error('Помилка завантаження файлу на AWS S3:', error);
      throw new Error('Не вдалося завантажити файл на сервер');
    }
  }

  async deleteFile(fileUrl: string): Promise<void> {
    try {
      if (!fileUrl.includes('amazonaws.com')) return;

      const urlParts = fileUrl.split('.amazonaws.com/');
      if (urlParts.length < 2) return;
      const key = urlParts[1];

      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
      this.logger.log(`Файл ${key} успішно видалено з S3`);
    } catch (error) {
      this.logger.error(`Помилка видалення файлу з AWS S3 (${fileUrl}):`, error);
    }
  }

  async generatePresignedUrl(fileUrl: string, expiresInSeconds: number = 900): Promise<string> {
    try {
      if (!fileUrl || !fileUrl.includes('amazonaws.com')) return fileUrl;

      const urlParts = fileUrl.split('.amazonaws.com/');
      if (urlParts.length < 2) return fileUrl;
      const key = urlParts[1];

      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const signedUrl = await getSignedUrl(this.s3Client as any, command, {
        expiresIn: expiresInSeconds,
      });
      return signedUrl;
    } catch (error) {
      this.logger.error(`Помилка генерації Presigned URL для ${fileUrl}:`, error);
      return fileUrl;
    }
  }

  async generateDownloadUrl(key: string, downloadFileName: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ResponseContentDisposition: `attachment; filename="${downloadFileName}"`,
    });

    return getSignedUrl(this.s3Client as any, command, { expiresIn: 3600 });
  }
}
