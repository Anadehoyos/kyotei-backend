import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCatalogEntryDto {
  @ApiProperty({ example: 'Activo' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;
}

export class UpdateCatalogEntryDto extends PartialType(CreateCatalogEntryDto) {}
