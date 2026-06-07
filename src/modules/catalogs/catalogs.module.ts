import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseApiModule } from 'src/database/database-api.module';
import { AuthModule } from '../auth/auth.module';
import { ContractStatus } from 'src/entities/api/catalogs/contract-status.entity';
import { Currency } from 'src/entities/api/catalogs/currency.entity';
import { DocumentType } from 'src/entities/api/catalogs/document-type.entity';
import { PaymentMethod } from 'src/entities/api/catalogs/payment-method.entity';
import { PaymentProvider } from 'src/entities/api/catalogs/payment-provider.entity';
import { PaymentTerm } from 'src/entities/api/catalogs/payment-term.entity';
import { SupplierCategory } from 'src/entities/api/catalogs/supplier-category.entity';
import { SupplierStatus } from 'src/entities/api/catalogs/supplier-status.entity';
import { ContractStatusesController } from './controllers/contract-statuses.controller';
import { CurrenciesController } from './controllers/currencies.controller';
import { DocumentTypesController } from './controllers/document-types.controller';
import { PaymentMethodsController } from './controllers/payment-methods.controller';
import { PaymentProvidersController } from './controllers/payment-providers.controller';
import { PaymentTermsController } from './controllers/payment-terms.controller';
import { SupplierCategoriesController } from './controllers/supplier-categories.controller';
import { SupplierStatusesController } from './controllers/supplier-statuses.controller';
import { ContractStatusesService } from './services/contract-statuses.service';
import { CurrenciesService } from './services/currencies.service';
import { DocumentTypesService } from './services/document-types.service';
import { PaymentMethodsService } from './services/payment-methods.service';
import { PaymentProvidersService } from './services/payment-providers.service';
import { PaymentTermsService } from './services/payment-terms.service';
import { SupplierCategoriesService } from './services/supplier-categories.service';
import { SupplierStatusesService } from './services/supplier-statuses.service';
import { CatalogsSeeder } from './seeders/catalogs.seeder';

@Module({
  imports: [
    DatabaseApiModule,
    AuthModule,
    TypeOrmModule.forFeature(
      [
        ContractStatus,
        PaymentMethod,
        PaymentTerm,
        SupplierCategory,
        SupplierStatus,
        Currency,
        DocumentType,
        PaymentProvider,
      ],
      'api',
    ),
  ],
  controllers: [
    ContractStatusesController,
    PaymentMethodsController,
    PaymentTermsController,
    SupplierCategoriesController,
    SupplierStatusesController,
    CurrenciesController,
    DocumentTypesController,
    PaymentProvidersController,
  ],
  providers: [
    ContractStatusesService,
    PaymentMethodsService,
    PaymentTermsService,
    SupplierCategoriesService,
    SupplierStatusesService,
    CurrenciesService,
    DocumentTypesService,
    PaymentProvidersService,
    CatalogsSeeder,
  ],
})
export class CatalogsModule {}
