import { Controller, Get, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from '../auth/decorators/user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { JwtPayload } from 'src/common/interface/jwt-payload.interface';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAllByOrganizationId(@User() user: JwtPayload) {
    const users = await this.usersService.findByOrganizationId(
      user.organizationId,
    );
    return users;
  }
}
