import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization } from '../entities/api/organizations/organization.entity';
import { Plan } from '../entities/api/plans/plan.entity';
import { PlanDiscount } from '../entities/api/plans/plan-discount.entity';
import { Membership } from '../entities/api/memberships/membership.entity';
import { Contract } from '../entities/api/contracts/contract.entity';
import { Supplier } from '../entities/api/suppliers/supplier.entity';
import { RenewalHistory } from '../entities/api/renewal-history/renewal-history.entity';
import { Document } from '../entities/api/documents/document.entity';
import { SupplierStatus } from '../entities/api/catalogs/supplier-status.entity';
import { ContractStatus } from '../entities/api/catalogs/contract-status.entity';
import { Currency } from '../entities/api/catalogs/currency.entity';
import { SupplierCategory } from '../entities/api/catalogs/supplier-category.entity';
import { PaymentTerm } from '../entities/api/catalogs/payment-term.entity';
import { DocumentType } from '../entities/api/catalogs/document-type.entity';
import { PaymentMethod } from '../entities/api/catalogs/payment-method.entity';
import { PaymentProvider } from '../entities/api/catalogs/payment-provider.entity';

const entities = [
	Organization,
	Plan,
	PlanDiscount,
	Membership,
	Contract,
	Supplier,
	RenewalHistory,
	Document,
	SupplierStatus,
	ContractStatus,
	Currency,
	SupplierCategory,
	PaymentTerm,
	DocumentType,
	PaymentMethod,
	PaymentProvider,
];

@Module({
	imports: [
		TypeOrmModule.forRootAsync({
			name: 'api',
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (config: ConfigService) => ({
				type: 'postgres',
				host: config.get('DB_API_HOST'),
				port: config.getOrThrow<number>('DB_API_PORT'),
				username: config.get('DB_API_USER'),
				password: config.get('DB_API_PASSWORD'),
				database: config.get('DB_API_DBNAME'),
				entities,
				synchronize: true,
				logging: true,
			}),
		}),
	],
	exports: [TypeOrmModule],
})
export class DatabaseApiModule { }
