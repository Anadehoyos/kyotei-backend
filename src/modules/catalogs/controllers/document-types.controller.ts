import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { DocumentTypesService } from '../services/document-types.service';

@ApiTags('catalogs')
@UseGuards(JwtAuthGuard)
@Controller('catalogs/document-types')
export class DocumentTypesController {
  constructor(private readonly service: DocumentTypesService) {}

  @Get()
  @ApiOperation({ summary: 'List available document types' })
  @ApiResponse({ status: 200, description: 'Document types' })
  findAll() {
    return this.service.findAll();
  }
}
