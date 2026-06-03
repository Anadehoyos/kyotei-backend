import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Organization } from 'src/entities/api/organizations/organization.entity';
import { Repository, DeleteResult } from 'typeorm';
import { RegisterOrganizationDto } from './dto/register-organization.dto';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(Organization, 'api')
    private readonly organizationRepo: Repository<Organization>,
  ) {}

  findByRuc(ruc: string) {
    return this.organizationRepo.findOneBy({ ruc });
  }

  findById(id: string) {
    return this.organizationRepo.findOneBy({ id });
  }

  async create(
    organizationDto: RegisterOrganizationDto,
  ): Promise<Organization> {
    const organization = new Organization();

    organization.name = organizationDto.name;
    organization.contact_email = organizationDto.contact_email;
    organization.ruc = organizationDto.ruc;
    organization.dv = organizationDto.dv;

    const existInOrganization = await this.organizationRepo.findOneBy([
      { name: organizationDto.name },
      { ruc: organizationDto.ruc },
      { contact_email: organizationDto.contact_email },
    ]);

    if (existInOrganization) {
      throw new ConflictException('Organization already exists');
    }

    return this.organizationRepo.save(organization);
  }

  delete(id: string): Promise<DeleteResult> {
    return this.organizationRepo.delete(id);
  }
}
