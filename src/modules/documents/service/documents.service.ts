import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
  S3ServiceException,
} from '@aws-sdk/client-s3';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { SuppliersService } from '../../suppliers/services/suppliers.service';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Contract } from 'src/entities/api/contracts/contract.entity';
import { Document } from 'src/entities/api/documents/document.entity';
import { UploadDocumentDto } from '../dto/upload-document.dto';

@Injectable()
export class DocumentsService {
  private client: S3Client;
  private bucketName: string;
  private maxFileSize: number;
  constructor(
    private readonly configService: ConfigService,
    private readonly suppliersService: SuppliersService,
    @InjectRepository(Contract, 'api')
    private readonly contractRepository: Repository<Contract>,
    @InjectRepository(Document, 'api')
    private readonly documentRepository: Repository<Document>,
    @InjectDataSource('api')
    private readonly dataSource: DataSource,
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
    this.maxFileSize = Number(this.configService.getOrThrow('MAX_FILE_SIZE'));

    this.client = new S3Client({
      region: aws_s3_region,
      credentials: {
        accessKeyId: this.configService.getOrThrow('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.getOrThrow('AWS_SECRET_ACCESS_KEY'),
      },
    });
  }

  async uploadSingleFile(
    dto: UploadDocumentDto,
    organizationId: string,
    user_id: string,
    file: Express.Multer.File,
  ) {
    let key: string | undefined;
    let uploadedToS3 = false;
    try {
      if (!file) {
        throw new BadRequestException('No file provided');
      }

      const isPdf = file.mimetype === 'application/pdf';
      const isFileSizeValid = file.size <= this.maxFileSize;

      if (!isPdf) {
        throw new BadRequestException('File must be a PDF');
      }

      if (!isFileSizeValid) {
        throw new BadRequestException(
          `File size must be less than ${Math.floor(this.maxFileSize / (1024 * 1024))}MB`,
        );
      }

      const sanitizedName = this.sanitizeFilename(file.originalname);

      await this.suppliersService.findOne(organizationId, dto.supplier_id);

      key = `${organizationId}/${dto.supplier_id}/${dto.uploadType}/${uuidv4()}-${sanitizedName}`;

      // 1. Save on S3 Bucket
      const createCommand = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        Metadata: {
          originalName: file.originalname,
        },
      });

      await this.client.send(createCommand);

      uploadedToS3 = true;

      // 2. Transaction to save on Contracts and Documents table
      await this.dataSource.transaction(async (manager) => {
        const contract = await manager.save(Contract, {
          title: dto.title,
          amount: dto.amount,
          start_date: new Date(dto.start_date),
          end_date: new Date(dto.end_date),
          supplier: { id: dto.supplier_id },
          currency: { id: dto.currency_id },
          status: { id: dto.status_id },
          organization: { id: organizationId },
          owner_id: user_id,
        });

        await manager.save(Document, {
          contract: { id: contract.id },
          file_name: sanitizedName,
          s3_key: key,
          type: dto.uploadType,
          uploaded_by_id: user_id,
          metadata: {
            extension: 'pdf',
            mime_type: file.mimetype,
            size_bytes: file.size,
          },
        });
      });
    } catch (error) {
      if (uploadedToS3 && key) {
        try {
          await this.deleteFile(key);
        } catch (deleteError) {
          console.error(`Error deleting file: ${deleteError}`);
        }
      }

      if (error instanceof S3ServiceException) {
        console.error(`Error uploading file: ${error.message}`);
        throw new HttpException(
          'Service unavailable',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }

      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException(error);
    }

    return {
      url: (await this.getPresignedUrl(key)).url,
      key,
    };
  }

  async deleteFile(key: string) {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      }),
    );
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

  async getContracts(organizationId: string): Promise<Contract[]> {
    const contracts = await this.contractRepository.find({
      where: { organization: { id: organizationId } },
      relations: ['organization', 'supplier', 'currency', 'status'],
    });
    return contracts;
  }

  async getDocumentsContractById(contractId: string): Promise<Document[]> {
    const documentsByContract = await this.documentRepository.find({
      where: { contract: { id: contractId } },
      relations: ['contract'],
    });
    return documentsByContract;
  }

  async getDocumentByContractAndDocumentId(
    contractId: string,
    documentId: string,
  ): Promise<Document> {
    const document = await this.documentRepository.findOne({
      where: { id: documentId, contract: { id: contractId } },
      relations: ['contract'],
    });
    if (!document) {
      throw new NotFoundException('Documento no encontrado');
    }
    return document;
  }

  async downloadDocument(contractId: string, documentId: string) {
    const document = await this.getDocumentByContractAndDocumentId(
      contractId,
      documentId,
    );
    if (!document) {
      throw new NotFoundException(
        'No se encontraron documentos para este contrato',
      );
    }

    return await this.getPresignedUrl(document.s3_key);
  }
}
