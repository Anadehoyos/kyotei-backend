import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

const NAME_PATTERN = /^[A-Za-zÀ-ÖØ-öø-ÿÁÉÍÓÚáéíóúÑñÜü\s]+$/;

export class CreateCatalogEntryDto {
  @ApiProperty({ example: 'ACTIVO' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Matches(NAME_PATTERN, {
    message: 'name must contain only letters and spaces',
  })
  name: string;
}

export class UpdateCatalogEntryDto extends PartialType(CreateCatalogEntryDto) {}
