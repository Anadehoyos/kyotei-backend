import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { RequirePermissions } from '../auth/decorators/permission.decorator';
import { User } from '../auth/decorators/user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permission.guard';
import type { JwtPayload } from 'src/common/interface/jwt-payload.interface';
import { UsersService } from './users.service';
import { InviteUserDto } from './dto/invite-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

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

  @Post('invite')
  @RequirePermissions('gestionar_usuarios')
  async inviteUser(
    @Body() inviteUserDto: InviteUserDto,
    @User() user: JwtPayload,
  ) {
    const invitedUser = await this.usersService.invite(
      inviteUserDto,
      user.organizationId,
    );
    return invitedUser;
  }

  @Patch(':userId')
  @RequirePermissions('gestionar_usuarios')
  async updateUser(
    @Param('userId') userId: string,
    @Body() updateUserDto: UpdateUserDto,
    @User() user: JwtPayload,
  ) {
    return this.usersService.updateUser(
      userId,
      updateUserDto,
      user.organizationId,
    );
  }
}
