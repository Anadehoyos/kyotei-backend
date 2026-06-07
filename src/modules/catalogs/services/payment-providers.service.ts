import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentProvider } from 'src/entities/api/catalogs/payment-provider.entity';

@Injectable()
export class PaymentProvidersService {
  constructor(
    @InjectRepository(PaymentProvider, 'api')
    private readonly paymentProviderRepo: Repository<PaymentProvider>,
  ) {}

  findAll() {
    return this.paymentProviderRepo.find({ order: { name: 'ASC' } });
  }
}
