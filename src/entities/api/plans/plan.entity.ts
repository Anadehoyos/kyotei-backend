import {
	Column,
	CreateDateColumn,
	Entity,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';

@Entity('plans')
export class Plan {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ length: 50 })
	name: string;

	@Column('numeric', { precision: 10, scale: 2 })
	monthly_price: string;

	@Column('numeric', { precision: 10, scale: 2 })
	yearly_price: string;

	@Column({ type: 'smallint', nullable: true })
	max_users: number | null;

	@Column({ type: 'smallint', nullable: true })
	max_suppliers: number | null;

	@Column({ type: 'int', nullable: true })
	max_contracts: number | null;

	@Column({ type: 'smallint', nullable: true })
	storage_gb: number | null;

	@Column({ default: false })
	has_pdf_reports: boolean;

	@Column({ default: false })
	has_api_access: boolean;

	@Column({ default: true })
	is_active: boolean;

	@CreateDateColumn({ type: 'timestamp' })
	created_at: Date;

	@UpdateDateColumn({ type: 'timestamp' })
	updated_at: Date;
}
