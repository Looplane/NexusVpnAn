import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('servers')
export class Server {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  city: string;

  @Column()
  country: string;

  @Column()
  countryCode: string;

  @Column()
  ipv4: string; // Public IP of the server

  @Column({ default: 51820 })
  wgPort: number;

  @Column({ nullable: true })
  publicKey: string; // WireGuard Public Key

  @Column({ default: false })
  isPremium: boolean;

  // SSH Access Details (In prod, use Vault or similar)
  @Column({ nullable: true })
  sshHost: string; 

  @Column({ default: 'root' })
  sshUser: string;

  @Column({ nullable: true, type: 'text' })
  sshPassword: string; // Encrypted password (optional - if provided, used as fallback when key auth fails)

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 0 })
  currentLoad: number; // 0-100

  @CreateDateColumn()
  createdAt: Date;
}