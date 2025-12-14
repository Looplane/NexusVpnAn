import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { MarketingService } from './marketing.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('admin/coupons')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MarketingController {
  constructor(private readonly marketingService: MarketingService) {}

  @Get()
  @Roles(UserRole.ADMIN)
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