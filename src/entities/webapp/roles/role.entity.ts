import {
	Column,
	CreateDateColumn,
	Entity,
	JoinTable,
	ManyToMany,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { Permission } from '../permissions/permission.entity';

@Entity('roles')
export class Role {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ length: 50 })
	name: string;

	@Column({ type: 'text', nullable: true })
	description: string | null;

	@ManyToMany(() => Permission)
	@JoinTable({
		name: 'role_permissions',
		joinColumn: { name: 'role_id', referencedColumnName: 'id' },
		inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
	})
	permissions: Permission[];

	@CreateDateColumn({ type: 'timestamp' })
	created_at: Date;
}
