import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

export enum UploadType {
  CONTRACT = 'contract',
  RENOVATION = 'renovation',
  RECEIPT = 'receipt',
}

export class DocumentUploadDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsNotEmpty()
  supplierId!: string;

  @ApiProperty({ enum: UploadType, example: UploadType.CONTRACT })
  @IsEnum(UploadType)
  @IsNotEmpty()
  uploadType!: UploadType;

  @ApiProperty({ type: 'string', format: 'binary' })
  @IsNotEmpty()
  file!: Express.Multer.File;
}
