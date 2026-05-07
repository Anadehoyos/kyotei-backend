import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { Organization } from '../organizations/organization.entity';

@Entity('supplier_statuses')
export class SupplierStatus {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@ManyToOne(() => Organization)
	@JoinColumn({ name: 'organization_id' })
	organization: Organization;

	@Column({ length: 100 })
	name: string;

	@CreateDateColumn({ type: 'timestamp' })
	created_at: Date;
}
