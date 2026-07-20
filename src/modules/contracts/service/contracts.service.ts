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
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { SuppliersService } from '../../suppliers/services/suppliers.service';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, DeepPartial, In, Repository } from 'typeorm';
import { Contract } from 'src/entities/api/contracts/contract.entity';
import { Document } from 'src/entities/api/documents/document.entity';
import { Currency } from 'src/entities/api/catalogs/currency.entity';
import { ContractStatus } from 'src/entities/api/catalogs/contract-status.entity';
import { UploadDocumentDto } from '../dto/upload-document.dto';
import { UploadType } from '../dto/s3bucket-upload.dto';
import { RenewContractDto } from '../dto/renew-contract.dto';
import { User } from 'src/entities/webapp/users/user.entity';
import { UpdateContractDto } from '../dto/update-contract.dto';
import { RenewalHistory } from 'src/entities/api/renewal-history/renewal-history.entity';

@Injectable()
export class ContractsService {
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
    @InjectRepository(User, 'webapp')
    private readonly userRepository: Repository<User>,
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

  // ---------------------------------------------------------------------------
  // Consultas de contratos y documentos
  // ---------------------------------------------------------------------------

  async getContracts(organizationId: string): Promise<Contract[]> {
    const contracts = await this.contractRepository.find({
      where: { organization: { id: organizationId } },
      relations: [
        'organization',
        'supplier',
        'supplier.category',
        'currency',
        'status',
      ],
    });

    const ownerId = [
      ...new Set(contracts.map((contract) => contract.owner_id)),
    ];

    const owner = await this.userRepository.find({
      where: { id: In(ownerId) },
    });

    const ownerById = new Map(owner.map((user) => [user.id, user]));

    return contracts.map((c) => ({
      ...c,
      owner: ownerById.get(c.owner_id)
        ? {
            id: c.owner_id,
            name: ownerById.get(c.owner_id)!.name,
            last_name: ownerById.get(c.owner_id)!.last_name,
          }
        : null,
    }));
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

  // ---------------------------------------------------------------------------
  // Carga de documentos
  // ---------------------------------------------------------------------------

  private async putPdf(
    file: Express.Multer.File,
    organizationId: string,
    supplierId: string,
    uploadType: UploadType,
  ): Promise<{ key: string; sanitizedName: string }> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('File must be a PDF');
    }
    if (file.size > this.maxFileSize) {
      throw new BadRequestException(
        `File size must be less than ${Math.floor(this.maxFileSize / (1024 * 1024))}MB`,
      );
    }

    const sanitizedName = this.sanitizeFilename(file.originalname);
    const key = `${organizationId}/${supplierId}/${uploadType}/${uuidv4()}-${sanitizedName}`;

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        Metadata: { originalName: file.originalname },
      }),
    );

    return { key, sanitizedName };
  }

  async uploadSingleFile(
    dto: UploadDocumentDto,
    organizationId: string,
    user_id: string,
    file: Express.Multer.File,
  ) {
    let key: string | undefined;
    try {
      await this.suppliersService.findOne(organizationId, dto.supplier_id);

      const uploaded = await this.putPdf(
        file,
        organizationId,
        dto.supplier_id,
        dto.uploadType,
      );
      key = uploaded.key;

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
          file_name: uploaded.sanitizedName,
          s3_key: uploaded.key,
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
      await this.rollbackAndRethrow(error, key);
    }

    return {
      url: (await this.getPresignedUrl(key!)).url,
      key,
    };
  }

  async renewContract(
    contractId: string,
    dto: RenewContractDto,
    organizationId: string,
    userId: string,
    file: Express.Multer.File,
  ) {
    const contract = await this.contractRepository.findOne({
      where: { id: contractId, organization: { id: organizationId } },
      relations: ['supplier'],
    });

    if (!contract) {
      throw new NotFoundException('Contract not found');
    }

    const previousStartDate = contract.start_date;
    const previousEndDate = contract.end_date;
    const previousAmount = contract.amount;

    let key: string | undefined;
    try {
      const uploaded = await this.putPdf(
        file,
        organizationId,
        contract.supplier.id,
        UploadType.RENEWAL,
      );
      key = uploaded.key;

      await this.dataSource.transaction(async (manager) => {
        await manager.update(
          Contract,
          { id: contract.id },
          {
            start_date: new Date(dto.new_start_date),
            end_date: new Date(dto.new_end_date),
            amount: dto.new_amount,
          },
        );

        await manager.save(RenewalHistory, {
          contract: { id: contract.id },
          previous_start_date: previousStartDate,
          previous_end_date: previousEndDate,
          new_start_date: new Date(dto.new_start_date),
          new_end_date: new Date(dto.new_end_date),
          previous_amount: previousAmount,
          new_amount: dto.new_amount,
          reason: dto.reason ?? '',
          renewed_by_id: userId,
        });

        await manager.save(Document, {
          contract: { id: contract.id },
          file_name: uploaded.sanitizedName,
          s3_key: uploaded.key,
          type: UploadType.RENEWAL,
          uploaded_by_id: userId,
          metadata: {
            extension: 'pdf',
            mime_type: file.mimetype,
            size_bytes: file.size,
          },
        });
      });
    } catch (error) {
      await this.rollbackAndRethrow(error, key);
    }

    return {
      url: (await this.getPresignedUrl(key!)).url,
      key,
    };
  }

  async uploadReceipt(
    contractId: string,
    organizationId: string,
    userId: string,
    file: Express.Multer.File,
  ) {
    const contract = await this.contractRepository.findOne({
      where: { id: contractId, organization: { id: organizationId } },
      relations: ['supplier'],
    });

    if (!contract) {
      throw new NotFoundException('Contract not found');
    }

    let key: string | undefined;
    try {
      const uploaded = await this.putPdf(
        file,
        organizationId,
        contract.supplier.id,
        UploadType.RECEIPT,
      );
      key = uploaded.key;

      await this.documentRepository.save({
        contract: { id: contract.id },
        file_name: uploaded.sanitizedName,
        s3_key: uploaded.key,
        type: UploadType.RECEIPT,
        uploaded_by_id: userId,
        metadata: {
          extension: 'pdf',
          mime_type: file.mimetype,
          size_bytes: file.size,
        },
      });
    } catch (error) {
      await this.rollbackAndRethrow(error, key);
    }

    return {
      url: (await this.getPresignedUrl(key!)).url,
      key,
    };
  }

  private async rollbackAndRethrow(
    error: unknown,
    key: string | undefined,
  ): Promise<never> {
    if (key) {
      try {
        await this.deleteFile(key);
      } catch (deleteError) {
        Logger.error(`Error deleting file: ${deleteError}`);
      }
    }

    if (error instanceof S3ServiceException) {
      Logger.error(`Error uploading file: ${error.message}`);
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

  async updateContract(
    contractId: string,
    dto: UpdateContractDto,
    organizationId: string,
  ) {
    const contract = await this.contractRepository.findOne({
      where: { id: contractId, organization: { id: organizationId } },
    });

    if (!contract) {
      throw new NotFoundException('Contract not found');
    }

    const changes: DeepPartial<Contract> = {};

    if (dto.title !== undefined) {
      changes.title = dto.title;
    }
    if (dto.amount !== undefined) {
      changes.amount = dto.amount;
    }
    if (dto.start_date !== undefined) {
      changes.start_date = new Date(dto.start_date);
    }
    if (dto.end_date !== undefined) {
      changes.end_date = new Date(dto.end_date);
    }

    if (dto.supplier_id !== undefined) {
      await this.suppliersService.findOne(organizationId, dto.supplier_id);
      changes.supplier = { id: dto.supplier_id };
    }
    if (dto.currency_id !== undefined) {
      const currency = await this.dataSource
        .getRepository(Currency)
        .findOneBy({ id: dto.currency_id });
      if (!currency) {
        throw new NotFoundException('Currency not found');
      }
      changes.currency = { id: dto.currency_id };
    }
    if (dto.status_id !== undefined) {
      const status = await this.dataSource
        .getRepository(ContractStatus)
        .findOneBy({ id: dto.status_id });
      if (!status) {
        throw new NotFoundException('Contract status not found');
      }
      changes.status = { id: dto.status_id };
    }

    this.contractRepository.merge(contract, changes);
    await this.contractRepository.save(contract);

    return this.contractRepository.findOne({
      where: { id: contractId },
      relations: [
        'organization',
        'supplier',
        'supplier.category',
        'currency',
        'status',
      ],
    });
  }

  // ---------------------------------------------------------------------------
  // Descarga de documentos
  // ---------------------------------------------------------------------------

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

  // ---------------------------------------------------------------------------
  // Operaciones sobre S3
  // ---------------------------------------------------------------------------

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

  // ---------------------------------------------------------------------------
  // Helpers privados
  // ---------------------------------------------------------------------------

  private sanitizeFilename(filename: string): string {
    const lastDot = filename.lastIndexOf('.');
    const hasExtension = lastDot > 0 && lastDot < filename.length - 1;

    const name = hasExtension ? filename.slice(0, lastDot) : filename;
    const ext = hasExtension ? filename.slice(lastDot + 1) : '';

    // Normalizar unicode → quitar tildes y caracteres especiales
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
