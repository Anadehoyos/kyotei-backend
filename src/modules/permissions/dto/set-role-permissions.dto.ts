import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID } from 'class-validator';

export class SetRolePermissionsDto {
  @ApiProperty({
    type: [String],
    example: ['550e8400-e29b-41d4-a716-446655440000'],
    description: 'IDs de los permisos que tendrá el rol (reemplaza los actuales)',
  })
  @IsArray()
  @IsUUID('all', { each: true })
  permissionIds: string[];
}
