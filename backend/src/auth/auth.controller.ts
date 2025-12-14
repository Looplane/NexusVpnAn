import { Controller, Request, Post, UseGuards, Get, Delete, Param, Body, Ip, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
      @Request() req, 
      @Body('code') code: string,
      @Ip() ip: string,
      @Headers('user-agent') userAgent: string
  ) {
    // In production (behind Nginx/Cloudflare), IP might need to be extracted from X-Forwarded-For
    // NestJS handles this if `app.set('trust proxy', 1)` is set in main.ts
    return this.authService.login(req.user, ip, userAgent, code);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/generate')
  async generate2fa(@Request() req) {
    return this.authService.generateTwoFactorSecret(req.user.userId, req.user.email);
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/enable')
  async enable2fa(@Request() req, @Body('code') code: string) {
    return this.authService.enableTwoFactor(req.user.userId, code);
  }

  // --- Session Management ---

  @UseGuards(JwtAuthGuard)
  @Get('sessions')
  async getSessions(@Request() req) {
      return this.authService.getSessions(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('sessions/:id')
  async revokeSession(@Request() req, @Param('id') id: string) {
      return this.authService.revokeSession(id, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('history')
  async getLoginHistory(@Request() req) {
      // Map entity fields to frontend expectations if needed, 
      // but current entity matches `LoginHistory` interface in types.ts roughly.
      const history = await this.authService.getLoginHistory(req.user.userId);
      return history.map(h => ({
          id: h.id,
          ip: h.ipAddress,
          location: h.location,
          device: h.userAgent, // Simplified for UI
          timestamp: h.timestamp,
          status: h.status
      }));
  }
}