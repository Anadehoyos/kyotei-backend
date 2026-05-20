import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt } from 'passport-jwt';
import { Strategy } from 'passport-jwt';
import { JwtPayload } from 'src/common/interface/jwt-payload.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.getOrThrow('JWT_SECRET_KEY'),
    });
  }

  validate(payload: JwtPayload): JwtPayload {
    return payload;
  }
}
