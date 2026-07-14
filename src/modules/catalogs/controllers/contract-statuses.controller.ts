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
import { PermissionsGuard } from 'src/modules/auth/guards/permission.guard';
import { RequirePermissions } from 'src/modules/auth/decorators/permission.decorator';
import { User } from 'src/modules/auth/decorators/user.decorator';
import type { JwtPayload } from 'src/common/interface/jwt-payload.interface';
import {
  CreateCatalogEntryDto,
  UpdateCatalogEntryDto,
} from '../dto/catalog-entry.dto';
import { ContractStatusesService } from '../services/contract-statuses.service';

@ApiTags('catalogs')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('catalogs/contract-statuses')
export class ContractStatusesController {
  constructor(private readonly service: ContractStatusesService) {}

  @Get()
  @ApiOperation({ summary: 'List contract statuses' })
  @ApiResponse({ status: 200, description: 'Contract statuses' })
  findAll(@User() user: JwtPayload) {
    return this.service.findAll(user.organizationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a contract status' })
  @ApiResponse({ status: 200, description: 'Contract status' })
  @ApiResponse({ status: 404, description: 'Contract status not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @User() user: JwtPayload) {
    return this.service.findOne(id, user.organizationId);
  }

  @Post()
  @RequirePermissions('configurar_catalogos')
  @ApiOperation({ summary: 'Create a contract status' })
  @ApiResponse({ status: 201, description: 'Contract status created' })
  create(@Body() dto: CreateCatalogEntryDto, @User() user: JwtPayload) {
    return this.service.create(dto, user.organizationId);
  }

  @Patch(':id')
  @RequirePermissions('configurar_catalogos')
  @ApiOperation({ summary: 'Update a contract status' })
  @ApiResponse({ status: 200, description: 'Contract status updated' })
  @ApiResponse({ status: 404, description: 'Contract status not found' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCatalogEntryDto,
    @User() user: JwtPayload,
  ) {
    return this.service.update(id, dto, user.organizationId);
  }

  @Delete(':id')
  @RequirePermissions('configurar_catalogos')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a contract status' })
  @ApiResponse({ status: 204, description: 'Contract status deleted' })
  @ApiResponse({ status: 404, description: 'Contract status not found' })
  delete(@Param('id', ParseUUIDPipe) id: string, @User() user: JwtPayload) {
    return this.service.delete(id, user.organizationId);
  }
}
