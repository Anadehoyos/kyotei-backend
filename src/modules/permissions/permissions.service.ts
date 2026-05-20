import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from 'src/entities/webapp/permissions/permission.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission, 'webapp')
    private readonly permissionRepo: Repository<Permission>,
  ) {}

  findByName(name: string) {
    return this.permissionRepo.findOneBy({ name });
  }

  findById(id: string) {
    return this.permissionRepo.findOneBy({ id });
  }
}
