import { Controller, Post, Get, Put, Body, UseGuards, Request, ValidationPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  async register(@Body(new ValidationPipe()) createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    const { passwordHash, ...result } = user;
    return result;
  }

  @UseGuards(JwtAuthGuard)
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
  async getReferralList(@Request() req) {
      return this.usersService.getReferrals(req.user.userId);
  }
}