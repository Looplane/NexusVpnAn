import { Module, Global, OnApplicationBootstrap } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { SystemSetting } from './entities/system-setting.entity';
import { AuditService } from './audit.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([AuditLog, SystemSetting])],
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule implements OnApplicationBootstrap {
  constructor(private readonly auditService: AuditService) {}
  
  async onApplicationBootstrap() {
    await this.auditService.seedSettings();
  }
}