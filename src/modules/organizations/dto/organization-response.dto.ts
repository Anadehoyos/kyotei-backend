import { ApiProperty } from '@nestjs/swagger';

export class OrganizationResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  ruc: string;

  @ApiProperty()
  dv: string;

  @ApiProperty()
  contact_email: string;

  @ApiProperty()
  is_active: boolean;

  @ApiProperty()
  created_at: Date;
}
