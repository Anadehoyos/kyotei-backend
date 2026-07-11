import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
} from 'class-validator';
import { IsAfter } from './interface/ValidDate';

export class CreateContractDto {
  @ApiProperty({ example: 'Contrato de servicios 2026' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title!: string;

  @ApiProperty({ example: '15000.50' })
  @IsNotEmpty()
  @Matches(/^\d+(\.\d{1,2})?$/, {
    message: 'amount must be a non-negative number with up to 2 decimal places',
  })
  amount!: string;

  @ApiProperty({ example: '2026-01-01' })
  @IsDateString()
  start_date!: string;

  @ApiProperty({ example: '2026-12-31' })
  @IsDateString()
  @IsAfter('start_date', { message: 'End date must be after start date' })
  end_date!: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  @IsNotEmpty()
  supplier_id!: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  @IsNotEmpty()
  currency_id!: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  @IsNotEmpty()
  status_id!: string;
}
