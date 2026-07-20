import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Contract } from 'src/entities/api/contracts/contract.entity';
import { Supplier } from 'src/entities/api/suppliers/supplier.entity';
import { Repository } from 'typeorm';

// "Activo" puede venir en español o inglés desde el catálogo de estados.
const ACTIVE_STATUS_NAMES = ['activo', 'active'];

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Contract, 'api')
    private readonly contractRepository: Repository<Contract>,
    @InjectRepository(Supplier, 'api')
    private readonly supplierRepository: Repository<Supplier>,
  ) {}

  async getReportsKpis(organizationId: string) {
    const totals = await this.contractRepository
      .createQueryBuilder('contracts')
      .select('COALESCE(SUM(contracts.amount), 0)', 'total')
      .addSelect('COALESCE(AVG(contracts.amount), 0)', 'average')
      .where('contracts.organization_id = :organizationId', { organizationId })
      .getRawOne<{ total: string; average: string }>();

    const activeContracts = await this.contractRepository
      .createQueryBuilder('contracts')
      .innerJoin('contracts.status', 'status')
      .select('COUNT(*)', 'count')
      .where('contracts.organization_id = :organizationId', { organizationId })
      .andWhere('LOWER(status.name) IN (:...active)', {
        active: ACTIVE_STATUS_NAMES,
      })
      .getRawOne<{ count: string }>();

    const activeSuppliers = await this.supplierRepository
      .createQueryBuilder('suppliers')
      .innerJoin('suppliers.status', 'status')
      .select('COUNT(*)', 'count')
      .where('suppliers.organization_id = :organizationId', { organizationId })
      .andWhere('LOWER(status.name) IN (:...active)', {
        active: ACTIVE_STATUS_NAMES,
      })
      .getRawOne<{ count: string }>();

    return {
      totalValueContracts: Number(totals?.total ?? 0),
      averageContractValue: Number(totals?.average ?? 0),
      activeContractCount: Number(activeContracts?.count ?? 0),
      activeSupplierCount: Number(activeSuppliers?.count ?? 0),
    };
  }

  async getContractsByCategory(organizationId: string) {
    // La categoría vive en el proveedor, no en el contrato: hay que unir
    // contracts -> supplier -> category y sumar el monto por categoría.
    const result = await this.contractRepository
      .createQueryBuilder('contracts')
      .leftJoin('contracts.supplier', 'supplier')
      .leftJoin('supplier.category', 'category')
      .select('category.name', 'category')
      .addSelect('SUM(contracts.amount)', 'amount')
      .where('contracts.organization_id = :organizationId', { organizationId })
      .groupBy('category.name')
      .orderBy('SUM(contracts.amount)', 'DESC')
      .getRawMany<{ category: string | null; amount: string | null }>();

    return result.map((item) => ({
      category: item.category ?? 'Sin categoría',
      amount: Number(item.amount ?? 0),
    }));
  }

  async getSuppliersByContractValue(organizationId: string) {
    const result = await this.contractRepository
      .createQueryBuilder('contracts')
      .leftJoin('contracts.supplier', 'supplier')
      .select('supplier.id', 'supplier_id')
      .addSelect('supplier.name', 'name')
      .addSelect('SUM(contracts.amount)', 'amount')
      .where('contracts.organization_id = :organizationId', { organizationId })
      .groupBy('supplier.id')
      .addGroupBy('supplier.name')
      .orderBy('SUM(contracts.amount)', 'DESC')
      .limit(5)
      .getRawMany<{
        supplier_id: string;
        name: string;
        amount: string | null;
      }>();

    return result.map((item) => ({
      supplier_id: item.supplier_id,
      name: item.name,
      amount: Number(item.amount ?? 0),
    }));
  }

  async getContractsDetail(organizationId: string) {
    const result = await this.contractRepository
      .createQueryBuilder('contracts')
      .leftJoin('contracts.supplier', 'supplier')
      .leftJoin('supplier.category', 'category')
      .leftJoin('contracts.status', 'status')
      .select('contracts.id', 'id')
      .addSelect('contracts.title', 'title')
      .addSelect('supplier.name', 'supplier_name')
      .addSelect('category.name', 'category')
      .addSelect('contracts.amount', 'value')
      .addSelect('contracts.end_date', 'end_date')
      .addSelect('status.name', 'status_name')
      .where('contracts.organization_id = :organizationId', { organizationId })
      .orderBy('contracts.end_date', 'ASC')
      .getRawMany<{
        id: string;
        title: string;
        supplier_name: string | null;
        category: string | null;
        value: string | null;
        end_date: string;
        status_name: string | null;
      }>();

    return result.map((item) => ({
      id: item.id,
      title: item.title,
      supplier_name: item.supplier_name,
      category: item.category ?? 'Sin categoría',
      value: Number(item.value ?? 0),
      end_date: item.end_date,
      status_name: item.status_name,
    }));
  }
}
