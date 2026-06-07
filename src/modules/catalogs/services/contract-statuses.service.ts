import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContractStatus } from 'src/entities/api/catalogs/contract-status.entity';
import {
  CreateCatalogEntryDto,
  UpdateCatalogEntryDto,
} from '../dto/catalog-entry.dto';

@Injectable()
export class ContractStatusesService {
  constructor(
    @InjectRepository(ContractStatus, 'api')
    private readonly repo: Repository<ContractStatus>,
  ) {}

  findAll(organizationId: string) {
    return this.repo.find({
      where: { organization: { id: organizationId } },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string, organizationId: string) {
    const entry = await this.repo.findOne({
      where: { id, organization: { id: organizationId } },
    });

    if (!entry) {
      throw new NotFoundException('Contract status not found');
    }

    return entry;
  }

  create(dto: CreateCatalogEntryDto, organizationId: string) {
    const entry = this.repo.create({
      name: dto.name,
      organization: { id: organizationId },
    });
    return this.repo.save(entry);
  }

  async update(id: string, dto: UpdateCatalogEntryDto, organizationId: string) {
    const entry = await this.findOne(id, organizationId);
    Object.assign(entry, dto);
    return this.repo.save(entry);
  }

  async delete(id: string, organizationId: string): Promise<void> {
    await this.findOne(id, organizationId);
    await this.repo.delete(id);
  }
}
