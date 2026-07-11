import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

export enum UploadType {
  CONTRACT = 'contract',
  RENEWAL = 'renewal',
  RECEIPT = 'receipt',
}

export class BucketFileDto {
  @ApiProperty({ enum: UploadType, example: UploadType.CONTRACT })
  @IsEnum(UploadType)
  @IsNotEmpty()
  uploadType!: UploadType;
}
