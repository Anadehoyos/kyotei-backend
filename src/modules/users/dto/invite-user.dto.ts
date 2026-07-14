import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, IsUUID, Length } from 'class-validator';

export class InviteUserDto {
  @ApiProperty({ example: 'user@gmail.com' })
  @IsEmail({}, { message: 'Invalid email' })
  @IsNotEmpty()
  @Transform(({ value }: { value: string }) => value.toLocaleLowerCase())
  email!: string;

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

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsNotEmpty()
  @IsUUID()
  roleId!: string;
}
