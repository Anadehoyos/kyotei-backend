import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('currencies')
export class Currency {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ length: 50 })
	name: string;

	@Column({ length: 5 })
	symbol: string;

	@Column({ length: 3 })
	iso_code: string;

	@CreateDateColumn({ type: 'timestamp' })
	created_at: Date;
}
