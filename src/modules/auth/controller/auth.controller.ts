import { Body, Controller, Get, Post } from '@nestjs/common';

@Controller('auth')
export class AuthController {

	@Post("/register-organization")
	registerOrganization(@Body(): ) {

	}

}
