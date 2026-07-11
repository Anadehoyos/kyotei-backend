import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { UploadType } from './s3bucket-upload.dto';

export class DocumentMetadataDto {
  @ApiProperty({ example: 'pdf' })
  @IsString()
  @IsNotEmpty()
  extension!: string;

  @ApiProperty({ example: 'application/pdf' })
  @IsString()
  @IsNotEmpty()
  mime_type!: string;

  @ApiProperty({ example: 1048576 })
  @IsInt()
  @Min(0)
  size_bytes!: number;
}

export class CreateDocumentDto {
  @ApiProperty({ example: 'contrato_servicios_2026.pdf' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  file_name!: string;

  @ApiProperty({
    example:
      '550e8400-e29b-41d4-a716-446655440000/550e8400-e29b-41d4-a716-446655440000/contract/archivo.pdf',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(512)
  s3_key!: string;

  @ApiProperty({ enum: UploadType, example: UploadType.CONTRACT })
  @IsEnum(UploadType)
  @IsNotEmpty()
  type!: UploadType;

  @ApiProperty({ type: DocumentMetadataDto })
  @IsObject()
  @ValidateNested()
  @Type(() => DocumentMetadataDto)
  metadata!: DocumentMetadataDto;
}
