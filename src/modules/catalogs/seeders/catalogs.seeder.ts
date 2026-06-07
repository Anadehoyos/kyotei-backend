import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Currency } from 'src/entities/api/catalogs/currency.entity';
import { DocumentType } from 'src/entities/api/catalogs/document-type.entity';
import { PaymentProvider } from 'src/entities/api/catalogs/payment-provider.entity';

const CURRENCIES: Pick<Currency, 'name' | 'symbol' | 'iso_code'>[] = [
  { name: 'Dólar Americano', symbol: '$', iso_code: 'USD' },
  { name: 'Sol Peruano', symbol: 'S/', iso_code: 'PEN' },
  { name: 'Euro', symbol: '€', iso_code: 'EUR' },
];

const DOCUMENT_TYPES: Pick<DocumentType, 'name'>[] = [
  { name: 'Factura' },
  { name: 'Boleta' },
  { name: 'Nota de Crédito' },
  { name: 'Nota de Débito' },
];

const PAYMENT_PROVIDERS: Pick<PaymentProvider, 'name'>[] = [
  { name: 'Visa' },
  { name: 'Mastercard' },
  { name: 'American Express' },
  { name: 'Yappy' },
];

@Injectable()
export class CatalogsSeeder implements OnModuleInit {
  private readonly logger = new Logger(CatalogsSeeder.name);

  constructor(
    @InjectRepository(Currency, 'api')
    private readonly currencyRepo: Repository<Currency>,
    @InjectRepository(DocumentType, 'api')
    private readonly documentTypeRepo: Repository<DocumentType>,
    @InjectRepository(PaymentProvider, 'api')
    private readonly paymentProviderRepo: Repository<PaymentProvider>,
  ) {}

  async onModuleInit() {
    await this.seedIfEmpty(this.currencyRepo, CURRENCIES, 'currencies');
    await this.seedIfEmpty(
      this.documentTypeRepo,
      DOCUMENT_TYPES,
      'document_types',
    );
    await this.seedIfEmpty(
      this.paymentProviderRepo,
      PAYMENT_PROVIDERS,
      'payment_providers',
    );
  }

  private async seedIfEmpty<T extends object>(
    repo: Repository<T>,
    rows: T[],
    label: string,
  ) {
    const count = await repo.count();
    if (count > 0) {
      return;
    }

    await repo.save(repo.create(rows));
    this.logger.log(`Seeded ${rows.length} rows into ${label}`);
  }
}
