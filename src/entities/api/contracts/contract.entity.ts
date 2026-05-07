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
import { Supplier } from '../suppliers/supplier.entity';
import { Currency } from '../catalogs/currency.entity';
import { ContractStatus } from '../catalogs/contract-status.entity';

@Entity('contracts')
export class Contract {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@ManyToOne(() => Organization)
	@JoinColumn({ name: 'organization_id' })
	organization: Organization;

	@ManyToOne(() => Supplier)
	@JoinColumn({ name: 'supplier_id' })
	supplier: Supplier;

	@Column({ length: 255 })
	title: string;

	@Column('numeric', { precision: 15, scale: 2 })
	amount: string;

	@ManyToOne(() => Currency)
	@JoinColumn({ name: 'currency_id' })
	currency: Currency;

	@Column({ type: 'date' })
	start_date: Date;

	@Column({ type: 'date' })
	end_date: Date;

	@ManyToOne(() => ContractStatus)
	@JoinColumn({ name: 'status_id' })
	status: ContractStatus;

	@Column('uuid')
	owner_id: string;

	@CreateDateColumn({ type: 'timestamp' })
	created_at: Date;

	@UpdateDateColumn({ type: 'timestamp' })
	updated_at: Date;
}
