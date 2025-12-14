import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { UsersModule } from './users/users.module';
import { VpnModule } from './vpn/vpn.module';
import { AuthModule } from './auth/auth.module';
import { LocationsModule } from './locations/locations.module';
import { SshModule } from './ssh/ssh.module';
import { PaymentsModule } from './payments/payments.module';
import { AdminModule } from './admin/admin.module';
import { UsageModule } from './usage/usage.module';
import { NotificationsModule } from './notifications/notifications.module';
import { DatabaseModule } from './database/database.module';
import { AuditModule } from './audit/audit.module';
import { SupportModule } from './support/support.module';
import { HealthModule } from './health/health.module';
import { MarketingModule } from './marketing/marketing.module';

import { User } from './users/entities/user.entity';
import { VpnConfig } from './vpn/entities/vpn-config.entity';
import { Server } from './locations/entities/server.entity';
import { IpAssignment } from './vpn/entities/ip-assignment.entity';
import { UsageRecord } from './usage/entities/usage.entity';
import { AuditLog } from './audit/entities/audit-log.entity';
import { SystemSetting } from './audit/entities/system-setting.entity';
import { Ticket } from './support/entities/ticket.entity';
import { TicketMessage } from './support/entities/ticket-message.entity';
import { Notification } from './notifications/entities/notification.entity';
import { Coupon } from './marketing/entities/coupon.entity';
import { Session } from './auth/entities/session.entity';
import { LoginHistory } from './auth/entities/login-history.entity';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    // Rate Limiting: 100 requests per 60 seconds
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        const isProduction = process.env.NODE_ENV === 'production';
        
        // Support for DATABASE_URL (common in PaaS like Render/Heroku/Railway)
        if (process.env.DATABASE_URL) {
          return {
            type: 'postgres',
            url: process.env.DATABASE_URL,
            entities: [User, VpnConfig, Server, IpAssignment, UsageRecord, AuditLog, SystemSetting, Ticket, TicketMessage, Notification, Coupon, Session, LoginHistory],
            synchronize: true, // Note: In a real prod app, use migrations instead of sync
            ssl: isProduction ? { rejectUnauthorized: false } : false, // Required for Supabase/Neon/Render
          };
        }

        return {
          type: 'postgres',
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT, 10) || 5432,
          username: process.env.DB_USER || 'nexus',
          password: process.env.DB_PASSWORD || 'secure_password_123',
          database: process.env.DB_NAME || 'nexusvpn',
          entities: [User, VpnConfig, Server, IpAssignment, UsageRecord, AuditLog, SystemSetting, Ticket, TicketMessage, Notification, Coupon, Session, LoginHistory],
          synchronize: true,
          ssl: isProduction && process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
        };
      }
    }),
    AuthModule,
    UsersModule,
    VpnModule,
    LocationsModule,
    SshModule,
    PaymentsModule,
    AdminModule,
    UsageModule,
    NotificationsModule,
    DatabaseModule,
    AuditModule,
    SupportModule,
    HealthModule,
    MarketingModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}