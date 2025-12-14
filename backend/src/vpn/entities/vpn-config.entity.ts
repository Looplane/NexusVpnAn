import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('vpn_configs')
export class VpnConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  locationId: string;

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

  @Column()
  userId: string;
}