import {
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterOrganizationAndUser } from '../dto/register-organization-and-user.dto';
import { OrganizationsService } from '../../organizations/organizations.service';
import { UsersService } from '../../users/users.service';
import { Organization } from 'src/entities/api/organizations/organization.entity';
import { OrganizationResponseDto } from '../../organizations/dto/organization-response.dto';
import { UserResponseDto } from '../../users/dto/user-response.dto';
import { LoginUserDto } from '../dto/login-user.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/common/interface/jwt-payload.interface';
import { SessionsService } from 'src/modules/sessions/sessions.service';
import { ConfigService } from '@nestjs/config';
import { RefreshTokenDto } from '../dto/refresh-token.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly organizationsService: OrganizationsService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly sessionsService: SessionsService,
    private readonly configService: ConfigService,
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

  async userLogin(loginDto: LoginUserDto) {
    const { email, password } = loginDto;
    try {
      const user = await this.usersService.findByEmail(email);

      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const validPassword = await bcrypt.compare(password, user.password_hash);

      if (!validPassword) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const payload: JwtPayload = {
        userId: user.id,
        organizationId: user.organization_id,
        email: user.email,
        firstName: user.name,
        lastName: user.last_name,
        isActive: user.is_active,
        role: user.role.name,
      };

      const accessToken = this.jwtService.sign(payload);
      const refreshToken = crypto.randomUUID();
      const expiresAt = new Date(
        Date.now() +
          Number(this.configService.getOrThrow('JWT_REFRESH_EXPIRES_IN')),
      );

      await this.sessionsService.create(user, refreshToken, expiresAt);

      return {
        message: 'Login successful',
        accessToken,
        refreshToken,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    const refreshToken = refreshTokenDto.refreshToken;
    const todayDate = new Date();
    try {
      const session = await this.sessionsService.findByToken(refreshToken);
      if (!session) {
        throw new UnauthorizedException('Invalid refresh token');
      }
      if (session.expires_at < todayDate) {
        await this.sessionsService.deleteByToken(refreshToken);
        throw new UnauthorizedException('Refresh token expired');
      }
      const payload = {
        userId: session.user.id,
        organizationId: session.user.organization_id,
        email: session.user.email,
        firstName: session.user.name,
        lastName: session.user.last_name,
        isActive: session.user.is_active,
        role: session.user.role.name,
      };
      const accessToken = this.jwtService.sign(payload);
      return {
        message: 'Token refreshed',
        accessToken,
        refreshToken,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(token: string) {
    await this.sessionsService.deleteByToken(token);
    return { message: 'Logged out successfully' };
  }
}
