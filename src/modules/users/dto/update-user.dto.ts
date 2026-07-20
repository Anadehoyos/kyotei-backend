import { RegisterUserDto } from './register-user.dto';
import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsUUID } from 'class-validator';

export class UpdateUserDto extends PartialType(
  OmitType(RegisterUserDto, ['password']),
) {
  @ApiProperty({ example: true })
  @IsBoolean()
  is_active!: boolean;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsNotEmpty()
  @IsUUID()
  roleId!: string;
}
