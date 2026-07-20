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
import { DataSource, DeepPartial, In, Repository } from 'typeorm';
import { Contract } from 'src/entities/api/contracts/contract.entity';
import { Document } from 'src/entities/api/documents/document.entity';
import { Currency } from 'src/entities/api/catalogs/currency.entity';
import { ContractStatus } from 'src/entities/api/catalogs/contract-status.entity';
import { UploadDocumentDto } from '../dto/upload-document.dto';
import { User } from 'src/entities/webapp/users/user.entity';
import { UpdateContractDto } from '../dto/update-contract.dto';

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

    // Validamos que las relaciones referenciadas existan antes de guardar; de lo
    // contrario un id inexistente reventaría con un error de FK (500) en vez de
    // un 404 limpio.
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

    // Devolvemos el contrato con sus relaciones cargadas (consistente con
    // GET /contracts), en vez de dejar supplier/currency/status como { id }.
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

  async updateContractStatus(
    contractId: string,
    statusId: string,
    organizationId: string,
  ) {
    const contract = await this.contractRepository.findOne({
      where: { id: contractId, organization: { id: organizationId } },
    });

    if (!contract) {
      throw new NotFoundException('Contrato no encontrado');
    }

    return await this.contractRepository.save(contract);
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
