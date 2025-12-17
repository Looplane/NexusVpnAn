import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('vpn_configs')
export class VpnConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Index()
  @Column()
  locationId: string;

  @Index()
  @Column()
  publicKey: string;

  // We intentionally do NOT store the Private Key.
  // It is generated once, shown to the user, and then discarded.
  
  @Column({ nullable: true })
  assignedIp: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Index()
  @Column()
  userId: string;
}