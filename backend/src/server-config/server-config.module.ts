import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Server } from '../locations/entities/server.entity';
import { ServerDetectionService } from './server-detection.service';
import { AutoConfigService } from './auto-config.service';
import { ServerConfigController } from './server-config.controller';
import { SshModule } from '../ssh/ssh.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Server]),
    SshModule,
  ],
  providers: [ServerDetectionService, AutoConfigService],
  controllers: [ServerConfigController],
  exports: [ServerDetectionService, AutoConfigService],
})
export class ServerConfigModule {}

