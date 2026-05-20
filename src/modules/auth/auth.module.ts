import { Module } from '@nestjs/common';
import { AuthController } from './controller/auth.controller';
import { AuthService } from './service/auth.service';
import { OrganizationsModule } from '../organizations/organizations.module';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SessionsModule } from '../sessions/sessions.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    OrganizationsModule,
    UsersModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow('JWT_SECRET_KEY'),
        signOptions: { expiresIn: config.getOrThrow('JWT_EXPIRES_IN') },
      }),
    }),
    SessionsModule,
    PassportModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
