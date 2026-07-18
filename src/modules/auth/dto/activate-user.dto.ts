import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class ActivateUserDto {
  @ApiProperty({ example: '' })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({ example: 'Pa$$word123' })
  @IsString()
  @IsNotEmpty()
  @Length(6, 50, { message: 'Password must be between 6 and 50 characters' })
  password: string;
}
