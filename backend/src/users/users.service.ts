import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { EmailService } from '../notifications/email.service';
import { CacheService } from '../cache/cache.service';
import { randomBytes } from 'crypto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private emailService: EmailService,
    private dataSource: DataSource,
    private cacheService: CacheService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Use database transaction for user creation and referral handling
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existingUser = await queryRunner.manager.findOne(User, {
        where: { email: createUserDto.email },
      });

      if (existingUser) {
        await queryRunner.rollbackTransaction();
        throw new ConflictException('Email already exists');
      }

      const salt = await bcrypt.genSalt();
      const passwordHash = await bcrypt.hash(createUserDto.password, salt);
      
      // Generate unique referral code for the new user
      const referralCode = randomBytes(4).toString('hex').toUpperCase();

      const user = queryRunner.manager.create(User, {
        email: createUserDto.email,
        fullName: createUserDto.fullName,
        passwordHash,
        referralCode,
      });

      // Handle Referral Logic within transaction
      if (createUserDto.referralCode) {
        const referrer = await queryRunner.manager.findOne(User, {
          where: { referralCode: createUserDto.referralCode },
        });
        if (referrer) {
          user.referredBy = referrer.id;
          // Update Referrer Stats within transaction
          await queryRunner.manager.increment(User, { id: referrer.id }, 'referralCount', 1);
          // Award credits within transaction
          await queryRunner.manager.increment(User, { id: referrer.id }, 'credits', 1000); // $10.00
        }
      }

      const savedUser = await queryRunner.manager.save(User, user);
      
      // Commit transaction
      await queryRunner.commitTransaction();
      
      // Trigger Async Email (outside transaction - fire and forget)
      this.emailService.sendWelcomeEmail(savedUser.email, savedUser.fullName || savedUser.email);

      return savedUser;
    } catch (error) {
      // Rollback on any error
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Release query runner
      await queryRunner.release();
    }
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

    const updatedUser = await this.usersRepository.save(user);
    
    // Invalidate user cache
    await this.cacheService.deletePattern(`user:*user:${id}*`);
    
    return updatedUser;
  }

  async getReferrals(userId: string, page = 1, limit = 20) {
      const skip = (page - 1) * limit;
      
      const [referrals, total] = await this.usersRepository.findAndCount({
          where: { referredBy: userId },
          select: ['email', 'createdAt', 'isActive', 'plan'], // Select minimal fields
          order: { createdAt: 'DESC' },
          skip,
          take: limit,
      });

      // Anonymize emails for privacy in the list view
      const anonymizedReferrals = referrals.map(r => ({
          ...r,
          email: r.email.replace(/(.{2})(.*)(@.*)/, '$1***$3')
      }));
      
      return {
          referrals: anonymizedReferrals,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
      };
  }
}