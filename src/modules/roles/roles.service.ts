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
    return this.roleRepo.findOne({ where: { name }, relations: ['permissions'] });
  }

  findById(id: string) {
    return this.roleRepo.findOneBy({ id });
  }

  findAll() {
    return this.roleRepo.find({
      order: { name: 'ASC' },
    });
  }
}
