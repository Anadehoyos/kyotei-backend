import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { RegisterOrganizationAndUser } from '../dto/register-organization-and-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterOrganizationAndUser) {
    return this.authService.registerOrganizationAndUser(dto);
  }
}
