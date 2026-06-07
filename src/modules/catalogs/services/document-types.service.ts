import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentType } from 'src/entities/api/catalogs/document-type.entity';

@Injectable()
export class DocumentTypesService {
  constructor(
    @InjectRepository(DocumentType, 'api')
    private readonly documentTypeRepo: Repository<DocumentType>,
  ) {}

  findAll() {
    return this.documentTypeRepo.find({ order: { name: 'ASC' } });
  }
}
