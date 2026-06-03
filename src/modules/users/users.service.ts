import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/webapp/users/user.entity';
import { Repository } from 'typeorm';
import { RegisterUserDto } from './dto/register-user.dto';
import * as bcrypt from 'bcrypt';
import { RolesService } from '../roles/roles.service';

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(User, 'webapp')
		private readonly userRepo: Repository<User>,
		private readonly rolesService: RolesService,
	) { }

	findByEmail(email: string) {
		return this.userRepo.findOne({ where: { email }, relations: ['role'] });
	}

	async create(
		userDto: RegisterUserDto,
		organizationId: string,
	): Promise<User> {
		const user = new User();

		const role = await this.rolesService.findByName('admin');

		if (!role) {
			throw new InternalServerErrorException('Role not found');
		}

		user.organization_id = organizationId;
		user.email = userDto.email;
		user.password_hash = await bcrypt.hash(userDto.password, 12);
		user.name = userDto.first_name;
		user.last_name = userDto.last_name;
		user.role = role;

		return this.userRepo.save(user);
	}
}
