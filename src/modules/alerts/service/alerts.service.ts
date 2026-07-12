import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Contract } from 'src/entities/api/contracts/contract.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AlertsService {
  constructor(
    @InjectRepository(Contract, 'api')
    private readonly contractRepository: Repository<Contract>,
  ) {}

  async getExpirationConstracts(organizationId: string) {
    const expirationSixtyDays = await this.contractRepository
      .createQueryBuilder('constracts')
      .where('constracts.organization_id = :organizationId', { organizationId })
      .andWhere('constracts.end_date - CURRENT_DATE >= :days', {
        days: 60,
      })
      .getCount();

    const expirationThirtyDays = await this.contractRepository
      .createQueryBuilder('constracts')
      .where('constracts.organization_id = :organizationId', { organizationId })
      .andWhere(
        'constracts.end_date - CURRENT_DATE BETWEEN :days1 AND :days2',
        {
          days1: 30,
          days2: 60,
        },
      )
      .getCount();

    const expiratedContracts = await this.contractRepository
      .createQueryBuilder('constracts')
      .where('constracts.organization_id = :organizationId', { organizationId })
      .andWhere('constracts.end_date < CURRENT_DATE')
      .getCount();

    const allExpirationContracts = [
      { expirationSixtyDays: expirationSixtyDays },
      { expirationThirtyDays: expirationThirtyDays },
      { expiratedContracts: expiratedContracts },
    ];

    return allExpirationContracts;
  }

  async getCriticalExpirationContracts(organizationId: string) {
    const criticExpirationContracts = await this.contractRepository
      .createQueryBuilder('contracts')
      .where('contracts.organization_id = :organizationId', { organizationId })
      .andWhere(
        'contracts.end_date - CURRENT_DATE >= 0 AND contracts.end_date - CURRENT_DATE <= :days',
        {
          days: 30,
        },
      )
      .getCount();

    return { criticExpirationContracts: criticExpirationContracts };
  }

  async getAllExpirationContracts(organizationId: string) {
    const allContracts = await this.contractRepository
      .createQueryBuilder('contracts')
      .leftJoin('contracts.supplier', 'supplier')
      .select([
        'contracts.id',
        'contracts.title',
        'contracts.amount',
        'contracts.start_date',
        'contracts.end_date',
        'supplier.name',
      ])
      .where(
        'contracts.organization_id = :organizationId AND contracts.end_date - CURRENT_DATE <= :days',
        { organizationId, days: 60 },
      )
      .getMany();
    return allContracts;
  }
}
