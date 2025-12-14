
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { CampaignService } from './campaign.service';
import { User } from '../users/entities/user.entity';
import { VpnConfig } from '../vpn/entities/vpn-config.entity';
import { Server } from '../locations/entities/server.entity';
import { SshModule } from '../ssh/ssh.module';

@Module({
  imports: [
      TypeOrmModule.forFeature([User, VpnConfig, Server]),
      SshModule
  ],
  controllers: [AdminController],
  providers: [AdminService, CampaignService],
})
export class AdminModule {}
