import { Module } from '@nestjs/common';
import { SuppliersController } from './controllers/suppliers.controller';
import { SuppliersService } from './services/suppliers.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Supplier } from 'src/entities/api/suppliers/supplier.entity';
import { DatabaseApiModule } from 'src/database/database-api.module';

@Module({
  imports: [DatabaseApiModule, TypeOrmModule.forFeature([Supplier], 'api')],
  controllers: [SuppliersController],
  providers: [SuppliersService],
})
export class SuppliersModule {}
