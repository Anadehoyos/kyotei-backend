import { S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DocumentsService {
  private client: S3Client;
  private bucketName: string;
  constructor(private readonly configService: ConfigService) {
    const aws_s3_bucketName: string =
      this.configService.getOrThrow('S3_BUCKET_NAME');
    const aws_s3_region: string = this.configService.getOrThrow('AWS_REGION');

    if (aws_s3_region === '') {
      throw new Error('AWS_REGION is not set');
    }

    if (aws_s3_bucketName === '') {
      throw new Error('S3_BUCKET_NAME is not set');
    }

    this.client = new S3Client({
      region: aws_s3_region,
      credentials: {
        accessKeyId: this.configService.getOrThrow('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.getOrThrow('AWS_SECRET_ACCESS_KEY'),
      },
    });
  }
}
