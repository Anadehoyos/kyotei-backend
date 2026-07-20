import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from 'src/entities/webapp/permissions/permission.entity';
import { Role } from 'src/entities/webapp/roles/role.entity';
import { In, Repository } from 'typeorm';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission, 'webapp')
    private readonly permissionRepo: Repository<Permission>,
    @InjectRepository(Role, 'webapp')
    private readonly roleRepo: Repository<Role>,
  ) {}

  findByName(name: string) {
    return this.permissionRepo.findOneBy({ name });
  }

  findById(id: string) {
    return this.permissionRepo.findOneBy({ id });
  }

  findAll() {
    return this.permissionRepo.find({ order: { name: 'ASC' } });
  }

  findRolesWithPermissions() {
    return this.roleRepo.find({
      relations: ['permissions'],
      order: { name: 'ASC' },
    });
  }

  async setRolePermissions(roleId: string, permissionIds: string[]) {
    const role = await this.roleRepo.findOne({
      where: { id: roleId },
      relations: ['permissions'],
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // Reemplaza el set completo de permisos del rol.
    role.permissions = permissionIds.length
      ? await this.permissionRepo.findBy({ id: In(permissionIds) })
      : [];

    await this.roleRepo.save(role);

    return this.roleRepo.findOne({
      where: { id: roleId },
      relations: ['permissions'],
    });
  }
}
