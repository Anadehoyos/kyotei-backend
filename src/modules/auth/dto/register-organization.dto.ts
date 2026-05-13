import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
  MinLength,
} from 'class-validator';

export class RegisterOrganizationDto {
  @ApiProperty({ example: 'My Organization' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name!: string;

  @ApiProperty({ example: '123456789' })
  @IsString()
  @IsNotEmpty()
  @MinLength(9)
  ruc!: string;

  @ApiProperty({ example: '0' })
  @IsNumber()
  dv!: number;

  @ApiProperty({ example: 'user@gmail.com' })
  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }: { value: string }) => value.toLocaleLowerCase())
  contact_email!: string;
}
