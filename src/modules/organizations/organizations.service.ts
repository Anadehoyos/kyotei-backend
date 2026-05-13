import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Organization } from 'src/entities/api/organizations/organization.entity';
import { Repository } from 'typeorm';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(Organization, 'api')
    private readonly organizationRepo: Repository<Organization>,
  ) {}

  findByRuc(ruc: string) {
    return this.organizationRepo.findOneBy({ ruc });
  }
}
