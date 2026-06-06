import { ApiProperty } from '@nestjs/swagger';
import { OrganizationResponseDto } from 'src/modules/organizations/dto/organization-response.dto';

export class SupplierResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ type: () => OrganizationResponseDto })
  organization: OrganizationResponseDto;

  @ApiProperty()
  name: string;

  @ApiProperty()
  ruc: string;

  @ApiProperty()
  dv: number;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  country: string;

  @ApiProperty()
  category_id: string;

  @ApiProperty()
  status_id: string;

  @ApiProperty()
  payment_term_id: string;

  @ApiProperty()
  payment_method_id: string;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}
