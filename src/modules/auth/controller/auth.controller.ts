import { Body, Controller, Delete, Post, UseGuards } from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { RegisterOrganizationAndUser } from '../dto/register-organization-and-user.dto';
import { LoginUserDto } from '../dto/login-user.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register organization and admin user' })
  @ApiResponse({ status: 201, description: 'Registration successful' })
  @ApiResponse({
    status: 409,
    description: 'Organization or user already exists',
  })
  register(@Body() dto: RegisterOrganizationAndUser) {
    return this.authService.registerOrganizationAndUser(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({
    status: 201,
    description: 'Login successful, returns access and refresh tokens',
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  login(@Body() dto: LoginUserDto) {
    return this.authService.userLogin(dto);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Get new access token using refresh token' })
  @ApiResponse({ status: 201, description: 'Returns new access token' })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto);
  }

  @Delete('logout')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Logout and invalidate refresh token' })
  @ApiResponse({ status: 201, description: 'Logged out successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  logout(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.logout(refreshTokenDto.refreshToken);
  }
}
