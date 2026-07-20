import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseWebappModule } from 'src/database/database-webapp.module';
import { Role } from 'src/entities/webapp/roles/role.entity';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { RolesSeeder } from './seeders/roles.seeder';

@Module({
  imports: [DatabaseWebappModule, TypeOrmModule.forFeature([Role], 'webapp')],
  providers: [RolesService, RolesSeeder],
  exports: [RolesService],
  controllers: [RolesController],
})
export class RolesModule {}
