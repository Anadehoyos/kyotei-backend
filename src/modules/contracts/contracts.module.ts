import { Module } from '@nestjs/common';
import { ContractsService } from './service/contracts.service';
import { SuppliersModule } from '../suppliers/suppliers.module';
import { ContractsController } from './controller/contracts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contract } from 'src/entities/api/contracts/contract.entity';
import { Document } from 'src/entities/api/documents/document.entity';
import { User } from 'src/entities/webapp/users/user.entity';

@Module({
  imports: [
    SuppliersModule,
    TypeOrmModule.forFeature([Contract, Document], 'api'),
    TypeOrmModule.forFeature([User], 'webapp'),
  ],
  providers: [ContractsService],
  controllers: [ContractsController],
  exports: [ContractsService],
})
export class ContractsModule {}
