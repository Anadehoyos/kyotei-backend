import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { RequirePermissions } from '../auth/decorators/permission.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permission.guard';
import { PermissionsService } from './permissions.service';
import { SetRolePermissionsDto } from './dto/set-role-permissions.dto';

@Controller('permissions')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions('gestionar_permisos')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  // Catálogo completo de permisos (filas de la matriz).
  @Get()
  findAll() {
    return this.permissionsService.findAll();
  }

  // Roles con sus permisos asignados (columnas de la matriz).
  @Get('roles')
  findRolesWithPermissions() {
    return this.permissionsService.findRolesWithPermissions();
  }

  // Reemplaza el set de permisos de un rol.
  @Put('roles/:roleId')
  setRolePermissions(
    @Param('roleId') roleId: string,
    @Body() dto: SetRolePermissionsDto,
  ) {
    return this.permissionsService.setRolePermissions(
      roleId,
      dto.permissionIds,
    );
  }
}
