import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { JwtPayload } from 'src/common/interface/jwt-payload.interface';

export const User = createParamDecorator(
	(_data: unknown, ctx: ExecutionContext): JwtPayload => {
		const request = ctx.switchToHttp().getRequest<Request>();
		return request.user as JwtPayload;
	},
);
