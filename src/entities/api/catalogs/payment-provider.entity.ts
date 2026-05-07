import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('payment_providers')
export class PaymentProvider {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ length: 50 })
	name: string;

	@CreateDateColumn({ type: 'timestamp' })
	created_at: Date;
}
