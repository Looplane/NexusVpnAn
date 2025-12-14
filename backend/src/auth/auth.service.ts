import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode';
import { AuditService } from '../audit/audit.service';
import { Session } from './entities/session.entity';
import { LoginHistory } from './entities/login-history.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private auditService: AuditService,
    @InjectRepository(Session) private sessionRepo: Repository<Session>,
    @InjectRepository(LoginHistory) private historyRepo: Repository<LoginHistory>,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);
    if (user && await bcrypt.compare(pass, user.passwordHash)) {
      const { passwordHash, twoFactorSecret, ...result } = user;
      return { ...result, twoFactorSecret, isTwoFactorEnabled: user.isTwoFactorEnabled, passwordHash: undefined };
    }
    return null;
  }

  async login(user: any, ip: string, userAgent: string, twoFactorCode?: string) {
    // 1. Check 2FA
    if (user.isTwoFactorEnabled) {
      if (!twoFactorCode) {
        // Log partial challenge
        await this.logHistory(user.id, ip, userAgent, '2fa_challenge');
        return { requires2fa: true };
      }
      
      const isValid = authenticator.verify({
        token: twoFactorCode,
        secret: user.twoFactorSecret,
      });

      if (!isValid) {
        await this.logHistory(user.id, ip, userAgent, 'failed');
        throw new UnauthorizedException('Invalid 2FA Code');
      }
    }

    // 2. Generate Token
    const payload = { email: user.email, sub: user.id, plan: user.plan, role: user.role };
    
    // 3. Create Session Record
    await this.createSession(user.id, ip, userAgent);
    await this.logHistory(user.id, ip, userAgent, 'success');
    await this.auditService.log('USER_LOGIN', user.id, undefined, 'Login successful', ip);
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.fullName,
        plan: user.plan,
        role: user.role,
        isTwoFactorEnabled: user.isTwoFactorEnabled
      }
    };
  }

  async createSession(userId: string, ip: string, userAgent: string) {
      // Basic device detection from UA string
      let deviceType = 'Unknown';
      if (userAgent.includes('Mobile')) deviceType = 'Mobile';
      else if (userAgent.includes('Windows')) deviceType = 'Windows PC';
      else if (userAgent.includes('Mac')) deviceType = 'Mac';
      else if (userAgent.includes('Linux')) deviceType = 'Linux Desktop';

      const session = this.sessionRepo.create({
          userId,
          ipAddress: ip,
          userAgent,
          deviceType,
          location: 'Unknown (GeoIP Pending)', // In real app, use GeoIP service
      });
      return this.sessionRepo.save(session);
  }

  async logHistory(userId: string, ip: string, userAgent: string, status: 'success' | 'failed' | '2fa_challenge') {
      const history = this.historyRepo.create({
          userId,
          ipAddress: ip,
          userAgent,
          status,
          location: 'Unknown'
      });
      await this.historyRepo.save(history);
  }

  async getSessions(userId: string) {
      const sessions = await this.sessionRepo.find({ 
          where: { userId }, 
          order: { lastActive: 'DESC' } 
      });
      
      // Mark "Current" based on logic (simplification: most recent is current for this MVP)
      // In real app, match session ID from JWT claim
      return sessions.map((s, i) => ({
          ...s,
          isCurrent: i === 0 
      }));
  }

  async revokeSession(id: string, userId: string) {
      const session = await this.sessionRepo.findOne({ where: { id, userId } });
      if (session) {
          await this.sessionRepo.remove(session);
      }
      return { success: true };
  }

  async getLoginHistory(userId: string) {
      return this.historyRepo.find({
          where: { userId },
          order: { timestamp: 'DESC' },
          take: 20
      });
  }

  async generateTwoFactorSecret(userId: string, email: string) {
    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(email, 'NexusVPN', secret);
    
    await this.usersService.update(userId, { twoFactorSecret: secret } as any);

    return {
      secret,
      qrCode: await toDataURL(otpauthUrl),
    };
  }

  async enableTwoFactor(userId: string, code: string) {
    const user = await this.usersService.findOneById(userId);
    const isValid = authenticator.verify({
      token: code,
      secret: user.twoFactorSecret,
    });

    if (!isValid) throw new UnauthorizedException('Invalid Code');

    await this.usersService.update(userId, { isTwoFactorEnabled: true } as any);
    await this.auditService.log('2FA_ENABLED', userId, undefined, 'User enabled 2FA');
    return { success: true };
  }
}