import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('activation_tokens')
export class ActivationToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamp' })
  expires_at: Date;

  @Column('uuid', { unique: true })
  token: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'timestamp', nullable: true })
  used_at: Date;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
