import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('usage_records')
export class UsageRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'bigint', default: 0 })
  bytesUploaded: string; // BigInt for large data

  @Column({ type: 'bigint', default: 0 })
  bytesDownloaded: string;

  @Column({ type: 'date' })
  recordDate: string; // YYYY-MM-DD

  @CreateDateColumn()
  createdAt: Date;
}