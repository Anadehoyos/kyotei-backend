import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { DocumentUploadDto } from './dto/document-upload.dto';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { SuppliersService } from '../suppliers/services/suppliers.service';

@Injectable()
export class DocumentsService {
  private client: S3Client;
  private bucketName: string;
  constructor(
    private readonly configService: ConfigService,
    private readonly suppliersService: SuppliersService,
  ) {
    const aws_s3_bucketName: string =
      this.configService.getOrThrow('S3_BUCKET_NAME');
    const aws_s3_region: string = this.configService.getOrThrow('AWS_REGION');

    if (aws_s3_region === '') {
      throw new Error('AWS_REGION is not set');
    }

    if (aws_s3_bucketName === '') {
      throw new Error('S3_BUCKET_NAME is not set');
    }

    this.bucketName = aws_s3_bucketName;

    this.client = new S3Client({
      region: aws_s3_region,
      credentials: {
        accessKeyId: this.configService.getOrThrow('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.getOrThrow('AWS_SECRET_ACCESS_KEY'),
      },
    });
  }

  async uploadSingleFile(dto: DocumentUploadDto, organizationId: string) {
    try {
      if (!dto.file) {
        throw new BadRequestException('No file provided');
      }

      const isPdf = dto.file.mimetype === 'application/pdf';
      const isFileSizeValid = dto.file.size <= 20 * 1024 * 1024;

      if (!isPdf) {
        throw new BadRequestException('File must be a PDF');
      }

      if (!isFileSizeValid) {
        throw new BadRequestException('File size must be less than 20MB');
      }

      const sanitizedName = this.sanitizeFilename(dto.file.originalname);

      await this.suppliersService.findOne(organizationId, dto.supplierId);

      const key = `${organizationId}/${dto.supplierId}/${dto.uploadType}/${uuidv4()}-${sanitizedName}`;

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: dto.file.buffer,
        ContentType: dto.file.mimetype,
        Metadata: {
          originalName: dto.file.originalname,
        },
      });

      await this.client.send(command);

      return {
        url: (await this.getPresignedUrl(key)).url,
        key,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(error);
    }
  }

  async getPresignedUrl(key: string) {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const url = await getSignedUrl(this.client, command, {
        expiresIn: 60 * 60 * 24,
      });
      return { url };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(error);
    }
  }

  private sanitizeFilename(filename: string): string {
    // Separar nombre y extensión
    const lastDot = filename.lastIndexOf('.');
    const hasExtension = lastDot > 0 && lastDot < filename.length - 1;

    const name = hasExtension ? filename.slice(0, lastDot) : filename;
    const ext = hasExtension ? filename.slice(lastDot + 1) : '';

    // Normalizar unicode → quitar tildes y caracteres especiales
    // ej: "Ñoño García" → "Nono Garcia"
    const normalizedName = name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // quitar diacríticos
      .replace(/[^a-zA-Z0-9\s\-_]/g, '') // solo alfanumérico, espacios, guiones
      .trim()
      .replace(/\s+/g, '_') // espacios → guiones bajos
      .replace(/_+/g, '_') // colapsar guiones bajos múltiples
      .toLowerCase();

    const normalizedExt = ext
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]/g, '')
      .toLowerCase();

    // Truncar nombre a 100 caracteres para no superar límites de S3
    const truncatedName = normalizedName.slice(0, 100);

    // Si queda vacío después de sanitizar, usar fallback
    const safeName = truncatedName || 'archivo';
    const safeExt = normalizedExt || '';

    return safeExt ? `${safeName}.${safeExt}` : safeName;
  }
}
