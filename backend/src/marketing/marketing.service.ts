import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coupon } from './entities/coupon.entity';

@Injectable()
export class MarketingService {
  constructor(
    @InjectRepository(Coupon)
    private couponRepo: Repository<Coupon>,
  ) {}

  async createCoupon(data: Partial<Coupon>) {
    const existing = await this.couponRepo.findOne({ where: { code: data.code } });
    if (existing) throw new ConflictException('Coupon code already exists');

    const coupon = this.couponRepo.create(data);
    return this.couponRepo.save(coupon);
  }

  async getCoupons() {
    return this.couponRepo.find({ order: { createdAt: 'DESC' } });
  }

  async deleteCoupon(id: string) {
    const result = await this.couponRepo.delete(id);
    if (result.affected === 0) throw new NotFoundException('Coupon not found');
    return { success: true };
  }

  async validateCoupon(code: string) {
    const coupon = await this.couponRepo.findOne({ where: { code, isActive: true } });
    if (!coupon) throw new NotFoundException('Invalid coupon');
    
    if (coupon.maxUses <= coupon.usedCount) {
        throw new ConflictException('Coupon usage limit reached');
    }
    
    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
        throw new ConflictException('Coupon expired');
    }

    return coupon;
  }
}