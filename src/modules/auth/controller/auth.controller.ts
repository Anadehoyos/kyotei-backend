import {
	Body,
	Controller,
	Delete,
	Get,
	Post,
	Req,
	Res,
	UnauthorizedException,
	UseGuards,
} from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { RegisterOrganizationAndUser } from '../dto/register-organization-and-user.dto';
import { LoginUserDto } from '../dto/login-user.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import type { Request, Response } from 'express';
import type { JwtPayload } from 'src/common/interface/jwt-payload.interface';
import { User } from '../decorators/user.decorator';

const isProd = process.env.NODE_ENV === 'production';

const httpOnlyCookie = {
	httpOnly: true,
	secure: isProd,
	sameSite: 'lax' as const,
};

const flagCookie = {
	httpOnly: false,
	secure: isProd,
	sameSite: 'lax' as const,
};

@ApiTags('auth')
@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) { }

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
	@ApiResponse({ status: 201, description: 'Login successful' })
	@ApiResponse({ status: 401, description: 'Invalid credentials' })
	async login(
		@Body() dto: LoginUserDto,
		@Res({ passthrough: true }) res: Response,
	) {
		const { accessToken, refreshToken } = await this.authService.userLogin(dto);

		res.cookie('auth_token', accessToken, {
			...httpOnlyCookie,
			maxAge: 15 * 60 * 1000,
		});

		res.cookie('refresh_token', refreshToken, {
			...httpOnlyCookie,
			maxAge: 7 * 24 * 60 * 60 * 1000,
		});

		res.cookie('auth_state', '1', {
			...flagCookie,
			maxAge: 7 * 24 * 60 * 60 * 1000,
		});

		return { message: 'Login Successful' };
	}

	@Get('me')
	@UseGuards(JwtAuthGuard)
	@ApiOperation({ summary: 'Get current authenticated user' })
	@ApiResponse({ status: 200, description: 'Returns JWT payload of current user' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	authMe(@User() user: JwtPayload): JwtPayload {
		return user;
	}

	@Post('refresh')
	@ApiOperation({ summary: 'Rotate access token using refresh_token cookie' })
	@ApiResponse({ status: 201, description: 'New access_token cookie issued' })
	@ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
	async refresh(
		@Req() req: Request,
		@Res({ passthrough: true }) res: Response,
	) {
		const refreshToken = req.cookies?.['refresh_token'] as string;

		if (!refreshToken) {
			throw new UnauthorizedException('No refresh token');
		}

		const { accessToken } = await this.authService.refreshToken(refreshToken);

		res.cookie('auth_token', accessToken, {
			...httpOnlyCookie,
			maxAge: 15 * 60 * 1000,
		});

		return { message: 'Token refreshed' };
	}

	@Delete('logout')
	@UseGuards(JwtAuthGuard)
	@ApiOperation({ summary: 'Logout and invalidate refresh token' })
	@ApiResponse({ status: 200, description: 'Logged out successfully' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
		const refreshToken = req.cookies?.['refresh_token'] as string;
		if (refreshToken) {
			await this.authService.logout(refreshToken);
		}
		res.clearCookie('auth_token');
		res.clearCookie('refresh_token');
		res.clearCookie('auth_state');
		return { message: 'Logout Successful' };
	}
}
