import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('sessions')
export class Session {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@ManyToOne(() => User)
	@JoinColumn({ name: 'user_id' })
	user: User;

	@Column({ length: 512 })
	token: string;

	@Column({ type: 'timestamp' })
	expires_at: Date;

	@CreateDateColumn({ type: 'timestamp' })
	created_at: Date;
}
