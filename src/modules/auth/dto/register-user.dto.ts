import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterUserDto {
  @ApiProperty({ example: 'user@gmail.com' })
  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }: { value: string }) => value.toLocaleLowerCase())
  email!: string;

  @ApiProperty({ example: 'Pa$$word123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password!: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  @MinLength(2)
  @IsNotEmpty()
  first_name!: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @MinLength(2)
  @IsNotEmpty()
  last_name!: string;
}
