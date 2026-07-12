import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Supplier } from 'src/entities/api/suppliers/supplier.entity';
import { Repository } from 'typeorm';
import { CreateSupplierDto } from '../dto/create-supplier.dto';
import { SupplierResponseDto } from '../dto/supplier-response.dto';
import { SupplierCategoriesService } from 'src/modules/catalogs/services/supplier-categories.service';
import { SupplierStatusesService } from 'src/modules/catalogs/services/supplier-statuses.service';
import { PaymentMethodsService } from 'src/modules/catalogs/services/payment-methods.service';
import { PaymentTermsService } from 'src/modules/catalogs/services/payment-terms.service';
import { Organization } from 'src/entities/api/organizations/organization.entity';
import { UpdateSupplierDto } from '../dto/update-supplier.dto';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectRepository(Supplier, 'api')
    private readonly supplierRepository: Repository<Supplier>,
    @InjectRepository(Organization, 'api')
    private readonly organizationRepository: Repository<Organization>,
    private readonly categorySupplierService: SupplierCategoriesService,
    private readonly statusSupplierService: SupplierStatusesService,
    private readonly paymentTermService: PaymentTermsService,
    private readonly paymentMethodService: PaymentMethodsService,
  ) {}

  async findAll(organization_id: string): Promise<Supplier[]> {
    return this.supplierRepository.find({
      where: {
        organization: { id: organization_id },
      },
      relations: ['category', 'status', 'payment_term', 'payment_method'],
    });
  }

  async findOne(
    organization_id: string,
    supplier_id: string,
  ): Promise<Supplier> {
    const supplier = await this.supplierRepository.findOne({
      where: {
        organization: { id: organization_id },
        id: supplier_id,
      },
      relations: ['category', 'status', 'payment_term', 'payment_method'],
    });

    if (!supplier) {
      throw new NotFoundException(`Supplier not found`);
    }

    return supplier;
  }

  async create(
    supplierDto: CreateSupplierDto,
    organization_id: string,
  ): Promise<SupplierResponseDto> {
    const supplier = new Supplier();

    const category = await this.categorySupplierService.findOne(
      supplierDto.category_id,
      organization_id,
    );

    const status = await this.statusSupplierService.findOne(
      supplierDto.status_id,
      organization_id,
    );

    const paymentTerm = await this.paymentTermService.findOne(
      supplierDto.payment_term_id,
      organization_id,
    );

    const paymentMethod = await this.paymentMethodService.findOne(
      supplierDto.payment_method_id,
      organization_id,
    );

    const organizationId = await this.organizationRepository.findOne({
      where: { id: organization_id },
    });

    const existingSupplier = await this.supplierRepository.findOneBy({
      ruc: supplierDto.ruc,
      dv: supplierDto.dv,
      phone: supplierDto.phone,
    });

    if (existingSupplier) {
      throw new ConflictException('Supplier already exists');
    }

    supplier.name = supplierDto.name;
    supplier.ruc = supplierDto.ruc;
    supplier.dv = supplierDto.dv;
    supplier.phone = supplierDto.phone;
    supplier.country = supplierDto.country;
    supplier.category = category;
    supplier.status = status;
    supplier.payment_term = paymentTerm;
    supplier.payment_method = paymentMethod;
    supplier.organization = organizationId as Organization;

    const saved = await this.supplierRepository.save(supplier);

    return {
      id: saved.id,
      organization: saved.organization,
      name: saved.name,
      ruc: saved.ruc,
      dv: saved.dv,
      phone: saved.phone,
      country: saved.country,
      category_id: saved.category?.id,
      status_id: saved.status?.id,
      payment_term_id: saved.payment_term?.id,
      payment_method_id: saved.payment_method?.id,
      created_at: saved.created_at,
      updated_at: saved.updated_at,
    };
  }

  async update(
    supplierId: string,
    organizationId: string,
    updateSupplierDto: UpdateSupplierDto,
  ): Promise<Supplier> {
    const supplier = await this.findOne(organizationId, supplierId);

    // Campos escalares editables (ruc y dv no son actualizables).
    if (updateSupplierDto.name !== undefined) {
      supplier.name = updateSupplierDto.name;
    }
    if (updateSupplierDto.phone !== undefined) {
      supplier.phone = updateSupplierDto.phone;
    }
    if (updateSupplierDto.country !== undefined) {
      supplier.country = updateSupplierDto.country;
    }

    // Relaciones: se resuelven desde el catálogo cuando llega el *_id.
    if (updateSupplierDto.category_id) {
      supplier.category = await this.categorySupplierService.findOne(
        updateSupplierDto.category_id,
        organizationId,
      );
    }
    if (updateSupplierDto.status_id) {
      supplier.status = await this.statusSupplierService.findOne(
        updateSupplierDto.status_id,
        organizationId,
      );
    }
    if (updateSupplierDto.payment_term_id) {
      supplier.payment_term = await this.paymentTermService.findOne(
        updateSupplierDto.payment_term_id,
        organizationId,
      );
    }
    if (updateSupplierDto.payment_method_id) {
      supplier.payment_method = await this.paymentMethodService.findOne(
        updateSupplierDto.payment_method_id,
        organizationId,
      );
    }

    return await this.supplierRepository.save(supplier);
  }

  async delete(id: string): Promise<void> {
    await this.supplierRepository.delete(id);
  }
}
