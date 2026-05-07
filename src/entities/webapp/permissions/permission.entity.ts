import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('permissions')
export class Permission {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ length: 100 })
	name: string;

	@Column({ type: 'text', nullable: true })
	description: string | null;
}
