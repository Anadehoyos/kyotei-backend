import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { SuppliersService } from '../services/suppliers.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateSupplierDto } from '../dto/create-supplier.dto';
import { SupplierResponseDto } from '../dto/supplier-response.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/modules/auth/guards/permission.guard';
import { RequirePermissions } from 'src/modules/auth/decorators/permission.decorator';
import { User } from 'src/modules/auth/decorators/user.decorator';
import type { JwtPayload } from 'src/common/interface/jwt-payload.interface';
import { UpdateSupplierDto } from '../dto/update-supplier.dto';

@ApiTags('suppliers')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Post()
  @RequirePermissions('crear_proveedor')
  @ApiOperation({ summary: 'Create a supplier' })
  @ApiResponse({
    status: 201,
    description: 'Supplier created',
    type: SupplierResponseDto,
  })
  async register(
    @Body() supplierDto: CreateSupplierDto,
    @User() user: JwtPayload,
  ) {
    return this.suppliersService.create(supplierDto, user.organizationId);
  }

  @Get()
  @RequirePermissions('ver_proveedores')
  @ApiOperation({ summary: 'List suppliers' })
  @ApiResponse({
    status: 200,
    description: 'Suppliers',
    type: [SupplierResponseDto],
  })
  async findAll(@User() user: JwtPayload) {
    return this.suppliersService.findAll(user.organizationId);
  }

  @Patch(':supplierId')
  @RequirePermissions('editar_proveedor')
  @ApiOperation({ summary: 'Update a supplier' })
  @ApiResponse({
    status: 200,
    description: 'Supplier updated',
    type: SupplierResponseDto,
  })
  async update(
    @User() user: JwtPayload,
    @Param('supplierId') supplierId: string,
    @Body() updateSupplierDto: UpdateSupplierDto,
  ) {
    return this.suppliersService.update(
      supplierId,
      user.organizationId,
      updateSupplierDto,
    );
  }
}
