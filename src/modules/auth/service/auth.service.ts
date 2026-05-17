import {
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { RegisterOrganizationAndUser } from '../dto/register-organization-and-user.dto';
import { OrganizationsService } from '../../organizations/organizations.service';
import { UsersService } from '../../users/users.service';
import { Organization } from 'src/entities/api/organizations/organization.entity';
import { OrganizationResponseDto } from '../../organizations/dto/organization-response.dto';
import { UserResponseDto } from '../../users/dto/user-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly organizationsService: OrganizationsService,
    private readonly usersService: UsersService,
  ) {}

  async registerOrganizationAndUser(dto: RegisterOrganizationAndUser) {
    let savedOrganization: Organization | undefined;

    try {
      const existingOrganization = await this.organizationsService.findByRuc(
        dto.ruc,
      );

      const existingUser = await this.usersService.findByEmail(dto.email);

      if (existingOrganization) {
        throw new ConflictException('Organization already exists');
      }

      if (existingUser) {
        throw new ConflictException('User already exists');
      }

      savedOrganization = await this.organizationsService.create({
        name: dto.name,
        ruc: dto.ruc,
        dv: dto.dv,
        contact_email: dto.contact_email,
      });

      const savedUser = await this.usersService.create(
        {
          email: dto.email,
          password: dto.password,
          first_name: dto.first_name,
          last_name: dto.last_name,
        },
        savedOrganization.id,
      );

      const organizationResponse: OrganizationResponseDto = {
        id: savedOrganization.id,
        name: savedOrganization.name,
        ruc: savedOrganization.ruc,
        dv: savedOrganization.dv,
        contact_email: savedOrganization.contact_email,
        is_active: savedOrganization.is_active,
        created_at: savedOrganization.created_at,
      };

      const userResponse: UserResponseDto = {
        id: savedUser.id,
        email: savedUser.email,
        first_name: savedUser.name,
        last_name: savedUser.last_name,
        is_active: savedUser.is_active,
        created_at: savedUser.created_at,
      };

      return {
        organization: organizationResponse,
        user: userResponse,
        message: 'Organization and user registered successfully',
      };
    } catch (error) {
      if (savedOrganization) {
        await this.organizationsService.delete(savedOrganization.id);
      }

      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Oops something went wrong');
    }
  }
}
