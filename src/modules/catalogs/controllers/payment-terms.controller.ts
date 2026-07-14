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
import { PaymentTermsService } from '../services/payment-terms.service';

@ApiTags('catalogs')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('catalogs/payment-terms')
export class PaymentTermsController {
  constructor(private readonly service: PaymentTermsService) {}

  @Get()
  @ApiOperation({ summary: 'List payment terms' })
  @ApiResponse({ status: 200, description: 'Payment terms' })
  findAll(@User() user: JwtPayload) {
    return this.service.findAll(user.organizationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a payment term' })
  @ApiResponse({ status: 200, description: 'Payment term' })
  @ApiResponse({ status: 404, description: 'Payment term not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @User() user: JwtPayload) {
    return this.service.findOne(id, user.organizationId);
  }

  @Post()
  @RequirePermissions('configurar_catalogos')
  @ApiOperation({ summary: 'Create a payment term' })
  @ApiResponse({ status: 201, description: 'Payment term created' })
  create(@Body() dto: CreateCatalogEntryDto, @User() user: JwtPayload) {
    return this.service.create(dto, user.organizationId);
  }

  @Patch(':id')
  @RequirePermissions('configurar_catalogos')
  @ApiOperation({ summary: 'Update a payment term' })
  @ApiResponse({ status: 200, description: 'Payment term updated' })
  @ApiResponse({ status: 404, description: 'Payment term not found' })
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
  @ApiOperation({ summary: 'Delete a payment term' })
  @ApiResponse({ status: 204, description: 'Payment term deleted' })
  @ApiResponse({ status: 404, description: 'Payment term not found' })
  delete(@Param('id', ParseUUIDPipe) id: string, @User() user: JwtPayload) {
    return this.service.delete(id, user.organizationId);
  }
}
