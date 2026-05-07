import { IsEmail } from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterOrganizationDto {
  name: string;
  ruc: string;
  dv: string;
  @ApiProperty({ example: 'user@gmail.com' })
  @IsEmail()
  contact_email: string;
  @ApiProperty({ example: 'user@gmail.com' })
  @IsEmail()
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}
