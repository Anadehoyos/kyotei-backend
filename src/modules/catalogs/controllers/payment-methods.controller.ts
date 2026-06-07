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
import { PaymentMethodsService } from '../services/payment-methods.service';

@ApiTags('catalogs')
@UseGuards(JwtAuthGuard)
@Controller('catalogs/payment-methods')
export class PaymentMethodsController {
  constructor(private readonly service: PaymentMethodsService) {}

  @Get()
  @ApiOperation({ summary: 'List payment methods' })
  @ApiResponse({ status: 200, description: 'Payment methods' })
  findAll(@User() user: JwtPayload) {
    return this.service.findAll(user.organizationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a payment method' })
  @ApiResponse({ status: 200, description: 'Payment method' })
  @ApiResponse({ status: 404, description: 'Payment method not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @User() user: JwtPayload) {
    return this.service.findOne(id, user.organizationId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a payment method' })
  @ApiResponse({ status: 201, description: 'Payment method created' })
  create(@Body() dto: CreateCatalogEntryDto, @User() user: JwtPayload) {
    return this.service.create(dto, user.organizationId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a payment method' })
  @ApiResponse({ status: 200, description: 'Payment method updated' })
  @ApiResponse({ status: 404, description: 'Payment method not found' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCatalogEntryDto,
    @User() user: JwtPayload,
  ) {
    return this.service.update(id, dto, user.organizationId);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a payment method' })
  @ApiResponse({ status: 204, description: 'Payment method deleted' })
  @ApiResponse({ status: 404, description: 'Payment method not found' })
  delete(@Param('id', ParseUUIDPipe) id: string, @User() user: JwtPayload) {
    return this.service.delete(id, user.organizationId);
  }
}
