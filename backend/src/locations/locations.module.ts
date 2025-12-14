import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Server } from './entities/server.entity';
import { LocationsService } from './locations.service';
import { LocationsController } from './locations.controller';

import { SshModule } from '../ssh/ssh.module';

@Module({
  imports: [TypeOrmModule.forFeature([Server]), SshModule],
  controllers: [LocationsController],
  providers: [LocationsService],
  exports: [LocationsService],
})
export class LocationsModule { }