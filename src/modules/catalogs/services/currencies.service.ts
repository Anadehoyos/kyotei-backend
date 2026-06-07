import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Currency } from 'src/entities/api/catalogs/currency.entity';

@Injectable()
export class CurrenciesService {
  constructor(
    @InjectRepository(Currency, 'api')
    private readonly currencyRepo: Repository<Currency>,
  ) {}

  findAll() {
    return this.currencyRepo.find({ order: { name: 'ASC' } });
  }
}
