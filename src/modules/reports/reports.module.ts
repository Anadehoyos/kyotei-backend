import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contract } from 'src/entities/api/contracts/contract.entity';
import { Supplier } from 'src/entities/api/suppliers/supplier.entity';
import { ReportsController } from './controller/reports.controller';
import { ReportsService } from './service/reports.service';

@Module({
  imports: [TypeOrmModule.forFeature([Contract, Supplier], 'api')],
  providers: [ReportsService],
  exports: [ReportsService],
  controllers: [ReportsController],
})
export class ReportsModule {}
