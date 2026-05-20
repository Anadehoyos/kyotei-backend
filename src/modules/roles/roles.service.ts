import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from 'src/entities/webapp/roles/role.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role, 'webapp')
    private readonly roleRepo: Repository<Role>,
  ) {}

  findByName(name: string) {
    return this.roleRepo.findOneBy({ name });
  }

  findById(id: string) {
    return this.roleRepo.findOneBy({ id });
  }
}
