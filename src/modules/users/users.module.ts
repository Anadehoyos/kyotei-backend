import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseWebappModule } from 'src/database/database-webapp.module';
import { User } from 'src/entities/webapp/users/user.entity';
import { UsersService } from './users.service';
import { RolesModule } from '../roles/roles.module';
import { UserController } from './user.controller';

@Module({
  imports: [
    DatabaseWebappModule,
    TypeOrmModule.forFeature([User], 'webapp'),
    RolesModule,
  ],
  providers: [UsersService],
  exports: [UsersService],
  controllers: [UserController],
})
export class UsersModule {}
