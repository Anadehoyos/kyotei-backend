import { Role } from 'src/entities/webapp/roles/role.entity';
import { RolesService } from './roles.service';
import { Get } from '@nestjs/common';
import { Controller } from '@nestjs/common';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  async findAll(): Promise<Role[]> {
    return this.rolesService.findAll();
  }
}
