import { Module } from '@nestjs/common';
import { SuppliersController } from './controllers/suppliers.controller';
import { SuppliersService } from './services/suppliers.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Supplier } from 'src/entities/api/suppliers/supplier.entity';
import { DatabaseApiModule } from 'src/database/database-api.module';
import { Organization } from 'src/entities/api/organizations/organization.entity';
import { CatalogsModule } from '../catalogs/catalogs.module';

@Module({
  imports: [
    DatabaseApiModule,
    TypeOrmModule.forFeature([Supplier, Organization], 'api'),
    CatalogsModule,
  ],
  controllers: [SuppliersController],
  providers: [SuppliersService],
  exports: [SuppliersService],
})
export class SuppliersModule {}
