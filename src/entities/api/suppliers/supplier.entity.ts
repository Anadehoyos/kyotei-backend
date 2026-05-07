import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';
import { Organization } from '../organizations/organization.entity';
import { SupplierCategory } from '../catalogs/supplier-category.entity';
import { SupplierStatus } from '../catalogs/supplier-status.entity';
import { PaymentTerm } from '../catalogs/payment-term.entity';
import { PaymentMethod } from '../catalogs/payment-method.entity';

@Entity('suppliers')
export class Supplier {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@ManyToOne(() => Organization)
	@JoinColumn({ name: 'organization_id' })
	organization: Organization;

	@Column({ length: 200 })
	name: string;

	@Column({ length: 20 })
	ruc: string;

	@Column({ type: 'smallint' })
	dv: number;

	@Column({ length: 20 })
	phone: string;

	@Column({ length: 100 })
	country: string;

	@ManyToOne(() => SupplierCategory)
	@JoinColumn({ name: 'category_id' })
	category: SupplierCategory;

	@ManyToOne(() => SupplierStatus)
	@JoinColumn({ name: 'status_id' })
	status: SupplierStatus;

	@ManyToOne(() => PaymentTerm)
	@JoinColumn({ name: 'payment_term_id' })
	payment_term: PaymentTerm;

	@ManyToOne(() => PaymentMethod)
	@JoinColumn({ name: 'payment_method_id' })
	payment_method: PaymentMethod;

	@CreateDateColumn({ type: 'timestamp' })
	created_at: Date;

	@UpdateDateColumn({ type: 'timestamp' })
	updated_at: Date;
}
