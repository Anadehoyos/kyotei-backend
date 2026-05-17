import { IntersectionType } from '@nestjs/swagger';
import { RegisterOrganizationDto } from '../../organizations/dto/register-organization.dto';
import { RegisterUserDto } from '../../users/dto/register-user.dto';

export class RegisterOrganizationAndUser extends IntersectionType(
  RegisterOrganizationDto,
  RegisterUserDto,
) {}
