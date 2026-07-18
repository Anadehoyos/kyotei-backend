import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/webapp/users/user.entity';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { RegisterUserDto } from './dto/register-user.dto';
import * as bcrypt from 'bcrypt';
import { RolesService } from '../roles/roles.service';
import { Role } from 'src/entities/webapp/roles/role.entity';
import { InviteUserDto } from './dto/invite-user.dto';
import { ActivationToken } from 'src/entities/webapp/invitation/activation-token.entity';
import { MailService } from '../mail/service/mail.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectDataSource('webapp')
    private readonly dataSource: DataSource,
    @InjectRepository(User, 'webapp')
    private readonly userRepo: Repository<User>,
    private readonly rolesService: RolesService,
    private readonly mailService: MailService,
  ) {}

  findByEmail(email: string) {
    return this.userRepo.findOne({
      where: { email },
      relations: ['role', 'role.permissions'],
    });
  }

  async create(
    userDto: RegisterUserDto,
    organizationId: string,
  ): Promise<User> {
    const role = await this.rolesService.findByName('admin');

    if (!role) {
      throw new InternalServerErrorException('Role not found');
    }

    return this.persistUser({
      email: userDto.email,
      name: userDto.first_name,
      last_name: userDto.last_name,
      organization_id: organizationId,
      role: role,
      password_hash: await bcrypt.hash(userDto.password, 12),
      is_active: true,
    });
  }

  async invite(
    userInvite: InviteUserDto,
    organizationId: string,
  ): Promise<{ message: string }> {
    const role = await this.rolesService.findById(userInvite.roleId);

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const activationToken = crypto.randomUUID();

    await this.dataSource.transaction(async (transactionalEntityManager) => {
      const user = await this.persistUser(
        {
          email: userInvite.email,
          name: userInvite.first_name,
          last_name: userInvite.last_name,
          organization_id: organizationId,
          role: role,
          password_hash: await bcrypt.hash(crypto.randomUUID(), 12),
          is_active: false,
        },
        transactionalEntityManager,
      );

      await transactionalEntityManager.save(ActivationToken, {
        token: activationToken,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
        user: { id: user.id },
      });
    });

    await this.mailService.sendActivationMail(
      userInvite.email,
      activationToken,
    );

    return { message: 'Invitation sent successfully' };
  }

  async findByOrganizationId(organizationId: string) {
    const users = await this.userRepo.find({
      where: {
        organization_id: organizationId,
      },
      relations: ['role'],
    });
    if (!users) {
      throw new NotFoundException('Users not found');
    }
    return users;
  }

  private persistUser(
    data: {
      email: string;
      name: string;
      last_name: string;
      organization_id: string;
      role: Role;
      password_hash: string;
      is_active: boolean;
    },
    entityManager?: EntityManager,
  ): Promise<User> {
    const user = new User();

    user.email = data.email;
    user.name = data.name;
    user.last_name = data.last_name;
    user.organization_id = data.organization_id;
    user.role = data.role;
    user.password_hash = data.password_hash;
    user.is_active = data.is_active;

    return entityManager
      ? entityManager.save<User>(user)
      : this.userRepo.save(user);
  }
}
