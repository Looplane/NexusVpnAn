import { Controller, Post, Get, Put, Body, UseGuards, Request, ValidationPipe, Query, Version } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Cache } from '../cache/decorators/cache.decorator';

@Controller({ path: 'users', version: '1' })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 registrations per minute
  @Post('register')
  async register(@Body(new ValidationPipe()) createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    const { passwordHash, ...result } = user;
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Cache(300, 'user') // Cache for 5 minutes
  @Get('me')
  async getProfile(@Request() req) {
    const user = await this.usersService.findOneById(req.user.userId);
    const { passwordHash, ...result } = user;
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Put('me')
  async updateProfile(@Request() req, @Body(new ValidationPipe()) updateUserDto: UpdateUserDto) {
    const user = await this.usersService.update(req.user.userId, updateUserDto);
    const { passwordHash, ...result } = user;
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Get('referrals')
  async getReferralStats(@Request() req) {
      const user = await this.usersService.findOneById(req.user.userId);
      return {
          totalInvited: user.referralCount,
          totalEarned: user.credits,
          referralCode: user.referralCode,
          pendingInvites: 0 // Placeholder logic for now
      };
  }

  @UseGuards(JwtAuthGuard)
  @Get('referrals/list')
  async getReferralList(
    @Request() req,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
      const pageNum = page ? parseInt(page, 10) : 1;
      const limitNum = limit ? parseInt(limit, 10) : 20;
      return this.usersService.getReferrals(req.user.userId, pageNum, limitNum);
  }
}