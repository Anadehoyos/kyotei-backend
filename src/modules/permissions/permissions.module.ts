import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseWebappModule } from 'src/database/database-webapp.module';
import { Permission } from 'src/entities/webapp/permissions/permission.entity';
import { PermissionsService } from './permissions.service';

@Module({
  imports: [
    DatabaseWebappModule,
    TypeOrmModule.forFeature([Permission], 'webapp'),
  ],
  providers: [PermissionsService],
  exports: [PermissionsService],
})
export class PermissionsModule {}
