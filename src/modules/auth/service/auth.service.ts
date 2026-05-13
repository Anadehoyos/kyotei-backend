import {
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { RegisterOrganizationAndUser } from '../dto/register-organization-and-user.dto';
import { OrganizationsService } from '../../organizations/organizations.service';
import { UsersService } from '../../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly organizationsService: OrganizationsService,
    private readonly usersService: UsersService,
  ) {}

  async registerOrganizationAndUser(dto: RegisterOrganizationAndUser) {
    try {
      const existingOrganization = await this.organizationsService.findByRuc(
        dto.ruc,
      );
      if (existingOrganization) {
        throw new ConflictException('Organization already exists');
      }

      const existingUser = await this.usersService.findByEmail(dto.email);
      if (existingUser) {
        throw new ConflictException('User already exists');
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Oops something went wrong');
    }
  }
}
