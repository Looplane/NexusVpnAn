import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { EmailService } from '../notifications/email.service';
import { randomBytes } from 'crypto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private emailService: EmailService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(createUserDto.password, salt);
    
    // Generate unique referral code for the new user
    const referralCode = randomBytes(4).toString('hex').toUpperCase();

    const user = this.usersRepository.create({
      email: createUserDto.email,
      fullName: createUserDto.fullName,
      passwordHash,
      referralCode,
    });

    // Handle Referral Logic
    if (createUserDto.referralCode) {
        const referrer = await this.usersRepository.findOne({ where: { referralCode: createUserDto.referralCode } });
        if (referrer) {
            user.referredBy = referrer.id;
            // Update Referrer Stats
            await this.usersRepository.increment({ id: referrer.id }, 'referralCount', 1);
            // Optionally award credits here, or wait until the new user pays
            // For MVP, we'll award credits immediately to demonstrate functionality
            await this.usersRepository.increment({ id: referrer.id }, 'credits', 1000); // $10.00
        }
    }

    const savedUser = await this.usersRepository.save(user);
    
    // Trigger Async Email
    this.emailService.sendWelcomeEmail(savedUser.email, savedUser.fullName || savedUser.email);

    return savedUser;
  }

  async findOneByEmail(email: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findOneById(id: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOneById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updateUserDto.fullName) {
      user.fullName = updateUserDto.fullName;
    }

    if (updateUserDto.email && updateUserDto.email !== user.email) {
       const existing = await this.findOneByEmail(updateUserDto.email);
       if (existing) throw new ConflictException('Email already in use');
       user.email = updateUserDto.email;
    }

    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt();
      user.passwordHash = await bcrypt.hash(updateUserDto.password, salt);
    }

    return this.usersRepository.save(user);
  }

  async getReferrals(userId: string) {
      const referrals = await this.usersRepository.find({
          where: { referredBy: userId },
          select: ['email', 'createdAt', 'isActive', 'plan'], // Select minimal fields
          order: { createdAt: 'DESC' }
      });

      // Anonymize emails for privacy in the list view
      return referrals.map(r => ({
          ...r,
          email: r.email.replace(/(.{2})(.*)(@.*)/, '$1***$3')
      }));
  }
}