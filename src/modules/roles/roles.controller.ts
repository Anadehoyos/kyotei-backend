import { Role } from 'src/entities/webapp/roles/role.entity';
import { RolesService } from './roles.service';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { RequirePermissions } from 'src/modules/auth/decorators/permission.decorator';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/modules/auth/guards/permission.guard';

@Controller('roles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @RequirePermissions('asignar_roles')
  async findAll(): Promise<Role[]> {
    return this.rolesService.findAll();
  }
}
