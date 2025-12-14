import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { User } from '../users/entities/user.entity';
import { Server } from '../locations/entities/server.entity';
import { UsageRecord } from '../usage/entities/usage.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Server, UsageRecord])],
  providers: [SeedService],
})
export class DatabaseModule {}