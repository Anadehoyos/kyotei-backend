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
import { SupplierCategoriesService } from '../services/supplier-categories.service';

@ApiTags('catalogs')
@UseGuards(JwtAuthGuard)
@Controller('catalogs/supplier-categories')
export class SupplierCategoriesController {
  constructor(private readonly service: SupplierCategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'List supplier categories' })
  @ApiResponse({ status: 200, description: 'Supplier categories' })
  findAll(@User() user: JwtPayload) {
    return this.service.findAll(user.organizationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a supplier category' })
  @ApiResponse({ status: 200, description: 'Supplier category' })
  @ApiResponse({ status: 404, description: 'Supplier category not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @User() user: JwtPayload) {
    return this.service.findOne(id, user.organizationId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a supplier category' })
  @ApiResponse({ status: 201, description: 'Supplier category created' })
  create(@Body() dto: CreateCatalogEntryDto, @User() user: JwtPayload) {
    return this.service.create(dto, user.organizationId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a supplier category' })
  @ApiResponse({ status: 200, description: 'Supplier category updated' })
  @ApiResponse({ status: 404, description: 'Supplier category not found' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCatalogEntryDto,
    @User() user: JwtPayload,
  ) {
    return this.service.update(id, dto, user.organizationId);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a supplier category' })
  @ApiResponse({ status: 204, description: 'Supplier category deleted' })
  @ApiResponse({ status: 404, description: 'Supplier category not found' })
  delete(@Param('id', ParseUUIDPipe) id: string, @User() user: JwtPayload) {
    return this.service.delete(id, user.organizationId);
  }
}
