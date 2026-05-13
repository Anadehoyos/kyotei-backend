import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseApiModule } from 'src/database/database-api.module';
import { Organization } from 'src/entities/api/organizations/organization.entity';
import { OrganizationsService } from './organizations.service';

@Module({
  imports: [DatabaseApiModule, TypeOrmModule.forFeature([Organization], 'api')],
  providers: [OrganizationsService],
  exports: [OrganizationsService],
})
export class OrganizationsModule {}
