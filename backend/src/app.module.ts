import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
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
import { ServerConfigModule } from './server-config/server-config.module';
import { DatabaseConfigService } from './database/database-config.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    // Rate Limiting: 100 requests per 60 seconds
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConfigService,
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
    ServerConfigModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule { }