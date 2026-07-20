import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { JwtPayload } from 'src/common/interface/jwt-payload.interface';
import { RequirePermissions } from 'src/modules/auth/decorators/permission.decorator';
import { User } from 'src/modules/auth/decorators/user.decorator';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/modules/auth/guards/permission.guard';
import { ContractsService } from '../service/contracts.service';
import { UploadDocumentDto } from '../dto/upload-document.dto';
import { UpdateContractDto } from '../dto/update-contract.dto';
import { RenewContractDto } from '../dto/renew-contract.dto';

@ApiTags('contracts')
@Controller('contracts')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Post()
  @RequirePermissions('crear_contrato', 'subir_documentos')
  @ApiOperation({
    summary: 'Upload a PDF document and create its contract',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadDocumentDto })
  @ApiResponse({
    status: 201,
    description: 'Document uploaded and contract created',
  })
  @ApiResponse({ status: 400, description: 'Invalid payload or file' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 503, description: 'S3 service unavailable' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Body() dto: UploadDocumentDto,
    @User() user: JwtPayload,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new FileTypeValidator({ fileType: 'application/pdf' })],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
  ) {
    return await this.contractsService.uploadSingleFile(
      dto,
      user.organizationId,
      user.userId,
      file,
    );
  }

  @Get()
  @RequirePermissions('ver_contratos')
  @ApiOperation({
    summary: 'List contracts of the current organization',
  })
  @ApiResponse({ status: 200, description: 'List of contracts' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getContracts(@User() user: JwtPayload) {
    return await this.contractsService.getContracts(user.organizationId);
  }

  @Get(':contractId/documents')
  @RequirePermissions('ver_documentos')
  @ApiOperation({ summary: 'List documents of a contract' })
  @ApiParam({
    name: 'contractId',
    description: 'Contract identifier (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({ status: 200, description: 'List of documents' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getDocumentsByContract(@Param('contractId') contractId: string) {
    return await this.contractsService.getDocumentsContractById(contractId);
  }

  @Patch(':contractId')
  @RequirePermissions('editar_contrato')
  @ApiOperation({ summary: 'Update a contract' })
  @ApiParam({
    name: 'contractId',
    description: 'Contract identifier (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({ type: UpdateContractDto })
  @ApiResponse({ status: 200, description: 'Contract updated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateContract(
    @Param('contractId') contractId: string,
    @Body() dto: UpdateContractDto,
    @User() user: JwtPayload,
  ) {
    return await this.contractsService.updateContract(
      contractId,
      dto,
      user.organizationId,
    );
  }

  @Post(':contractId/renew')
  @RequirePermissions('renovar_contrato')
  @ApiOperation({ summary: 'Renew a contract' })
  @ApiParam({
    name: 'contractId',
    description: 'Contract identifier (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: RenewContractDto })
  @ApiResponse({ status: 200, description: 'Contract renewed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Contract not found' })
  @UseInterceptors(FileInterceptor('file'))
  async renewContract(
    @Param('contractId') contractId: string,
    @Body() dto: RenewContractDto,
    @User() user: JwtPayload,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new FileTypeValidator({ fileType: 'application/pdf' })],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
  ) {
    return await this.contractsService.renewContract(
      contractId,
      dto,
      user.organizationId,
      user.userId,
      file,
    );
  }

  @Post(':contractId/receipts')
  @RequirePermissions('subir_documentos')
  @ApiOperation({ summary: 'Upload a payment receipt for a contract' })
  @ApiParam({
    name: 'contractId',
    description: 'Contract identifier (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @ApiResponse({ status: 201, description: 'Receipt uploaded' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Contract not found' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadReceipt(
    @Param('contractId') contractId: string,
    @User() user: JwtPayload,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new FileTypeValidator({ fileType: 'application/pdf' })],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
  ) {
    return await this.contractsService.uploadReceipt(
      contractId,
      user.organizationId,
      user.userId,
      file,
    );
  }

  @Get(':contractId/download/:documentId')
  @RequirePermissions('ver_documentos')
  @ApiOperation({
    summary: 'Get a presigned download URL for a document',
  })
  @ApiParam({
    name: 'contractId',
    description: 'Contract identifier (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiParam({
    name: 'documentId',
    description: 'Document identifier (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({ status: 200, description: 'Presigned download URL' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async downloadDocument(
    @Param('contractId') contractId: string,
    @Param('documentId') documentId: string,
  ) {
    return await this.contractsService.downloadDocument(contractId, documentId);
  }
}
