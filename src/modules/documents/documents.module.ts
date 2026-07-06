import { Module } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { SuppliersService } from '../suppliers/services/suppliers.service';

@Module({
  providers: [DocumentsService, SuppliersService],
})
export class DocumentsModule {}
