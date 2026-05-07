import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/webapp/users/user.entity';
import { Role } from '../entities/webapp/roles/role.entity';
import { Permission } from '../entities/webapp/permissions/permission.entity';
import { Session } from '../entities/webapp/sessions/session.entity';

const entities = [User, Role, Permission, Session];

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      name: 'webapp',
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_WEBAPP_HOST'),
        port: config.getOrThrow<number>('DB_WEBAPP_PORT'),
        username: config.get('DB_WEBAPP_USER'),
        password: config.get('DB_WEBAPP_PASSWORD'),
        database: config.get('DB_WEBAPP_DBNAME'),
        entities,
        synchronize: true,
      }),
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseWebappModule {}
