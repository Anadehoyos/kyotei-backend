import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseWebappModule } from 'src/database/database-webapp.module';
import { Permission } from 'src/entities/webapp/permissions/permission.entity';
import { Role } from 'src/entities/webapp/roles/role.entity';
import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';

@Module({
  imports: [
    DatabaseWebappModule,
    TypeOrmModule.forFeature([Permission, Role], 'webapp'),
  ],
  providers: [PermissionsService],
  exports: [PermissionsService],
  controllers: [PermissionsController],
})
export class PermissionsModule {}
