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
import { Plan } from '../plans/plan.entity';

export type MembershipStatus = 'trialing' | 'active' | 'expired' | 'canceled';
export type BillingCycle = 'monthly' | 'yearly';
export type PaymentProviderType = 'stripe' | 'pagoefacil' | 'manual';

@Entity('memberships')
export class Membership {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@ManyToOne(() => Organization)
	@JoinColumn({ name: 'organization_id' })
	organization: Organization;

	@ManyToOne(() => Plan)
	@JoinColumn({ name: 'plan_id' })
	plan: Plan;

	@Column({ length: 20 })
	status: MembershipStatus;

	@Column({ length: 10 })
	billing_cycle: BillingCycle;

	@Column({ type: 'date' })
	start_date: Date;

	@Column({ type: 'date' })
	end_date: Date;

	@Column({ type: 'timestamp', nullable: true })
	trial_ends_at: Date | null;

	@Column({ default: false })
	auto_renew: boolean;

	@Column({ length: 20 })
	payment_provider: PaymentProviderType;

	@Column({ type: 'varchar', length: 100, nullable: true })
	external_id: string | null;

	@CreateDateColumn({ type: 'timestamp' })
	created_at: Date;

	@UpdateDateColumn({ type: 'timestamp' })
	updated_at: Date;
}
