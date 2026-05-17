import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class RegisterUserDto {
  @ApiProperty({ example: 'user@gmail.com' })
  @IsEmail({}, { message: 'Invalid email' })
  @IsNotEmpty()
  @Transform(({ value }: { value: string }) => value.toLocaleLowerCase())
  email!: string;

  @ApiProperty({ example: 'Pa$$word123' })
  @IsString()
  @IsNotEmpty()
  @Length(6, 50, { message: 'Password must be between 6 and 50 characters' })
  password!: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  @Length(2, 30, { message: 'First name must be between 2 and 30 characters' })
  @IsNotEmpty()
  first_name!: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @Length(2, 30, { message: 'Last name must be between 2 and 30 characters' })
  @IsNotEmpty()
  last_name!: string;
}
