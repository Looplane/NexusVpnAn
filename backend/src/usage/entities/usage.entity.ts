import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('usage_records')
export class UsageRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'bigint', default: 0 })
  bytesUploaded: string; // BigInt for large data

  @Column({ type: 'bigint', default: 0 })
  bytesDownloaded: string;

  @Index(['userId', 'recordDate']) // Composite index for efficient user usage queries
  @Column({ type: 'date' })
  recordDate: string; // YYYY-MM-DD

  @CreateDateColumn()
  createdAt: Date;
}