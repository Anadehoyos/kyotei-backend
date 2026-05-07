import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { Contract } from '../contracts/contract.entity';

export type DocumentKind = 'contract' | 'renewal' | 'receipt';

export interface DocumentMetadata {
	extension: string;
	mime_type: string;
	size_bytes: number;
}

@Entity('documents')
export class Document {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@ManyToOne(() => Contract)
	@JoinColumn({ name: 'contract_id' })
	contract: Contract;

	@Column({ length: 255 })
	file_name: string;

	@Column({ length: 512 })
	s3_key: string;

	@Column({ length: 50 })
	type: DocumentKind;

	@Column('uuid')
	uploaded_by_id: string;

	@Column('jsonb')
	metadata: DocumentMetadata;

	@CreateDateColumn({ type: 'timestamp' })
	created_at: Date;
}
