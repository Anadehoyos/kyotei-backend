import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { User } from 'src/modules/auth/decorators/user.decorator';
import type { JwtPayload } from 'src/common/interface/jwt-payload.interface';
import {
  CreateCatalogEntryDto,
  UpdateCatalogEntryDto,
} from '../dto/catalog-entry.dto';
import { SupplierStatusesService } from '../services/supplier-statuses.service';

@ApiTags('catalogs')
@UseGuards(JwtAuthGuard)
@Controller('catalogs/supplier-statuses')
export class SupplierStatusesController {
  constructor(private readonly service: SupplierStatusesService) {}

  @Get()
  @ApiOperation({ summary: 'List supplier statuses' })
  @ApiResponse({ status: 200, description: 'Supplier statuses' })
  findAll(@User() user: JwtPayload) {
    return this.service.findAll(user.organizationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a supplier status' })
  @ApiResponse({ status: 200, description: 'Supplier status' })
  @ApiResponse({ status: 404, description: 'Supplier status not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @User() user: JwtPayload) {
    return this.service.findOne(id, user.organizationId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a supplier status' })
  @ApiResponse({ status: 201, description: 'Supplier status created' })
  create(@Body() dto: CreateCatalogEntryDto, @User() user: JwtPayload) {
    return this.service.create(dto, user.organizationId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a supplier status' })
  @ApiResponse({ status: 200, description: 'Supplier status updated' })
  @ApiResponse({ status: 404, description: 'Supplier status not found' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCatalogEntryDto,
    @User() user: JwtPayload,
  ) {
    return this.service.update(id, dto, user.organizationId);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a supplier status' })
  @ApiResponse({ status: 204, description: 'Supplier status deleted' })
  @ApiResponse({ status: 404, description: 'Supplier status not found' })
  delete(@Param('id', ParseUUIDPipe) id: string, @User() user: JwtPayload) {
    return this.service.delete(id, user.organizationId);
  }
}
