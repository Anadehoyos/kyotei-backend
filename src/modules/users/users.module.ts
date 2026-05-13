import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseWebappModule } from 'src/database/database-webapp.module';
import { User } from 'src/entities/webapp/users/user.entity';
import { UsersService } from './users.service';

@Module({
  imports: [DatabaseWebappModule, TypeOrmModule.forFeature([User], 'webapp')],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
