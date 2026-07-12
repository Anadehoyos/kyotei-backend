import { PartialType } from '@nestjs/mapped-types';
import { CreateSupplierDto } from './create-supplier.dto';
import { OmitType } from '@nestjs/swagger';

export class UpdateSupplierDto extends PartialType(
  OmitType(CreateSupplierDto, ['ruc', 'dv']),
) {}
