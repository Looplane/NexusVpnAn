
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VpnConfig } from './entities/vpn-config.entity';
import { IpAssignment } from './entities/ip-assignment.entity';
import { VpnService } from './vpn.service';
import { VpnSyncService } from './vpn-sync.service';
import { VpnController } from './vpn.controller';
import { SshModule } from '../ssh/ssh.module';
import { LocationsModule } from '../locations/locations.module';
import { IpamService } from './ipam.service';
import { UsersModule } from '../users/users.module';
import { UsageModule } from '../usage/usage.module';
import { Server } from '../locations/entities/server.entity';
import { FirewallService } from './firewall.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([VpnConfig, IpAssignment, Server]),
    SshModule,
    LocationsModule,
    UsersModule,
    UsageModule, 
  ],
  controllers: [VpnController],
  providers: [VpnService, IpamService, VpnSyncService, FirewallService],
  exports: [TypeOrmModule],
})
export class VpnModule {}
