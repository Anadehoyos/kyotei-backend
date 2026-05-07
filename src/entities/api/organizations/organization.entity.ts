import {
	Column,
	CreateDateColumn,
	Entity,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';

@Entity('organizations')
export class Organization {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ length: 200 })
	name: string;

	@Column({ length: 20 })
	ruc: string;

	@Column({ type: 'smallint' })
	dv: number;

	@Column({ length: 255 })
	contact_email: string;

	@Column({ default: true })
	is_active: boolean;

	@CreateDateColumn({ type: 'timestamp' })
	created_at: Date;

	@UpdateDateColumn({ type: 'timestamp' })
	updated_at: Date;
}
