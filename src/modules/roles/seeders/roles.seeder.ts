import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from 'src/entities/webapp/roles/role.entity';
import { Repository } from 'typeorm';
import { Logger } from '@nestjs/common';

const ROLES: Pick<Role, 'name' | 'description' | 'permissions'>[] = [
  {
    name: 'admin',
    description: 'Acceso total al sistema',
    permissions: [],
  },
  {
    name: 'compras',
    description: 'Gestión de proveedores y creación de contratos',
    permissions: [],
  },
  {
    name: 'legal',
    description: 'Aprobación y renovación de contratos',
    permissions: [],
  },
  {
    name: 'viewer',
    description: 'Acceso de solo lectura al sistema',
    permissions: [],
  },
];

@Injectable()
export class RolesSeeder implements OnModuleInit {
  private readonly logger = new Logger(RolesSeeder.name);

  constructor(
    @InjectRepository(Role, 'webapp')
    private readonly roleRepository: Repository<Role>,
  ) {}

  async onModuleInit() {
    await this.seedIfEmpty(this.roleRepository, ROLES, 'roles');
  }

  async seedIfEmpty<T extends object>(
    repo: Repository<T>,
    rows: T[],
    label: string,
  ) {
    const count = await repo.count();
    if (count > 0) {
      return;
    }

    await repo.save(repo.create(rows));
    this.logger.log(`Seeded ${label}`);
  }
}
