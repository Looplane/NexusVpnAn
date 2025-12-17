import { Controller, Get, Post, Delete, Body, Param, UseGuards, Version } from '@nestjs/common';
import { MarketingService } from './marketing.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { Cache } from '../cache/decorators/cache.decorator';

@Controller({ path: 'admin/coupons', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
export class MarketingController {
  constructor(private readonly marketingService: MarketingService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  @Cache(600, 'coupons') // Cache for 10 minutes
  async getCoupons() {
    return this.marketingService.getCoupons();
  }

  @Post()
  @Roles(UserRole.ADMIN)
  async createCoupon(@Body() body: any) {
    return this.marketingService.createCoupon(body);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async deleteCoupon(@Param('id') id: string) {
    return this.marketingService.deleteCoupon(id);
  }
}