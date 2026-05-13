import { IntersectionType } from '@nestjs/swagger';
import { RegisterOrganizationDto } from './register-organization.dto';
import { RegisterUserDto } from './register-user.dto';

export class RegisterOrganizationAndUser extends IntersectionType(
  RegisterOrganizationDto,
  RegisterUserDto,
) {}
