import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Server } from '../../locations/entities/server.entity';

@Entity('ip_assignments')
export class IpAssignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  ipAddress: string; // e.g., 10.100.0.5

  @Column()
  serverId: string;

  @ManyToOne(() => Server)
  @JoinColumn({ name: 'serverId' })
  server: Server;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  assignedAt: Date;
}