import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { Plan } from './plan.entity';

export type BillingCycle = 'monthly' | 'yearly';

@Entity('plan_discounts')
export class PlanDiscount {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@ManyToOne(() => Plan)
	@JoinColumn({ name: 'plan_id' })
	plan: Plan;

	@Column({ length: 10 })
	billing_cycle: BillingCycle;

	@Column('numeric', { precision: 5, scale: 2 })
	percentage: string;

	@CreateDateColumn({ type: 'timestamp' })
	created_at: Date;
}
