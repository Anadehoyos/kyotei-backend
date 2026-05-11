import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Organization } from '../../../entities/api/organizations/organization.entity';
import { User } from '../../../entities/webapp/users/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { RegisterOrganizationAndUser } from '../dto/register-organization-and-user.dto';

@Injectable()
export class AuthService {
	constructor(
		@InjectRepository(Organization, 'api')
		private readonly organizationRepo: Repository<Organization>,
		@InjectRepository(User, 'webapp')
		private readonly userRepo: Repository<User>,
	) { }

	registerOrganizationAndUser(dto: RegisterOrganizationAndUser) {
		try {
			// register organization
			const countOrganization = this.organizationRepo.findOne({
				where: { ruc: dto.ruc }
			});
			if (!countOrganization) {

			}
			// register user

		} catch (error) {

		}
		return dto;
	}
}

