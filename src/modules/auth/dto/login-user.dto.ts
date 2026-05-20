import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class LoginUserDto {
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
}
