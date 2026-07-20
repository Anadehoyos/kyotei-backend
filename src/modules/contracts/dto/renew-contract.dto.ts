import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { IsAfter } from './interface/ValidDate';

export class RenewContractDto {
  @ApiProperty({ example: '2027-01-01' })
  @IsDateString()
  new_start_date!: string;

  @ApiProperty({ example: '2027-12-31' })
  @IsDateString()
  @IsAfter('new_start_date', {
    message: 'new_end_date must be after new_start_date',
  })
  new_end_date!: string;

  @ApiProperty({ example: '18000.00' })
  @IsNotEmpty()
  @Matches(/^\d+(\.\d{1,2})?$/, {
    message:
      'new_amount must be a non-negative number with up to 2 decimal places',
  })
  new_amount!: string;

  @ApiPropertyOptional({
    example: 'Renovación anual por continuidad del servicio',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  reason?: string;
}
