import { Module } from '@nestjs/common';
import { DocumentsService } from './service/documents.service';
import { SuppliersModule } from '../suppliers/suppliers.module';
import { DocumentController } from './controller/document.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contract } from 'src/entities/api/contracts/contract.entity';
import { Document } from 'src/entities/api/documents/document.entity';

@Module({
  imports: [
    SuppliersModule,
    TypeOrmModule.forFeature([Contract, Document], 'api'),
  ],
  providers: [DocumentsService],
  controllers: [DocumentController],
})
export class DocumentsModule {}
