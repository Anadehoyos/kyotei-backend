import { Controller, Get, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { RequirePermissions } from '../auth/decorators/permission.decorator';
import { User } from '../auth/decorators/user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permission.guard';
import type { JwtPayload } from 'src/common/interface/jwt-payload.interface';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('users')
export class UserController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @RequirePermissions('gestionar_usuarios')
  async findAllByOrganizationId(@User() user: JwtPayload) {
    const users = await this.usersService.findByOrganizationId(
      user.organizationId,
    );
    return users;
  }
}
