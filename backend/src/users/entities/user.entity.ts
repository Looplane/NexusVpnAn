import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum UserPlan {
  FREE = 'free',
  BASIC = 'basic',
  PRO = 'pro',
}

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column({ nullable: true })
  fullName: string;

  @Column({
    type: 'enum',
    enum: UserPlan,
    default: UserPlan.FREE,
  })
  plan: UserPlan;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Index()
  @Column({ nullable: true })
  stripeCustomerId: string;

  @Column({ default: true })
  isActive: boolean;
  
  // 2FA Fields
  @Column({ nullable: true })
  twoFactorSecret: string;

  @Column({ default: false })
  isTwoFactorEnabled: boolean;

  // Referral System
  @Column({ unique: true, nullable: true })
  referralCode: string;

  @Index()
  @Column({ nullable: true })
  referredBy: string; // ID of the user who referred this user

  @Column({ default: 0 })
  referralCount: number;

  @Column({ default: 0 })
  credits: number; // Stored in cents (e.g. 1000 = $10.00)

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}