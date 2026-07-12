import { Module } from '@nestjs/common';
import { ContractsService } from './service/contracts.service';
import { SuppliersModule } from '../suppliers/suppliers.module';
import { ContractsController } from './controller/contracts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contract } from 'src/entities/api/contracts/contract.entity';
import { Document } from 'src/entities/api/documents/document.entity';

@Module({
  imports: [
    SuppliersModule,
    TypeOrmModule.forFeature([Contract, Document], 'api'),
  ],
  providers: [ContractsService],
  controllers: [ContractsController],
})
export class ContractsModule {}
