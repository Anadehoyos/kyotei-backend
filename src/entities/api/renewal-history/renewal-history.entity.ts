import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { Contract } from '../contracts/contract.entity';

@Entity('renewal_history')
export class RenewalHistory {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@ManyToOne(() => Contract)
	@JoinColumn({ name: 'contract_id' })
	contract: Contract;

	@Column({ type: 'date' })
	previous_start_date: Date;

	@Column({ type: 'date' })
	previous_end_date: Date;

	@Column({ type: 'date' })
	new_start_date: Date;

	@Column({ type: 'date' })
	new_end_date: Date;

	@Column('numeric', { precision: 15, scale: 2 })
	previous_amount: string;

	@Column('numeric', { precision: 15, scale: 2 })
	new_amount: string;

	@Column({ type: 'text' })
	reason: string;

	@Column('uuid')
	renewed_by_id: string;

	@CreateDateColumn({ type: 'timestamp' })
	created_at: Date;
}
