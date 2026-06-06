import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Supplier } from 'src/entities/api/suppliers/supplier.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectRepository(Supplier, 'api')
    private readonly supplierRepository: Repository<Supplier>,
  ) {}

  async findAll(): Promise<Supplier[]> {
    return this.supplierRepository.find();
  }

  async create(supplier: Supplier): Promise<Supplier> {
    return this.supplierRepository.save(supplier);
  }

  async update(id: string, supplier: Supplier): Promise<Supplier> {
    if (id.length === 0) {
      throw new InternalServerErrorException('Supplier must be provided');
    }

    await this.supplierRepository.update(id, supplier);

    const updatedSupplier = await this.supplierRepository.findOneBy({ id });

    if (!updatedSupplier) {
      throw new NotFoundException(`Supplier not found`);
    }

    return updatedSupplier;
  }

  async delete(id: string): Promise<void> {
    await this.supplierRepository.delete(id);
  }
}
