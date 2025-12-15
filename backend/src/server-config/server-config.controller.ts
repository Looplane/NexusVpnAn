import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { ServerDetectionService } from './server-detection.service';
import { AutoConfigService } from './auto-config.service';

@Controller('admin/server-config')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ServerConfigController {
  constructor(
    private readonly detectionService: ServerDetectionService,
    private readonly autoConfigService: AutoConfigService,
  ) {}

  /**
   * Detect OS on remote server
   */
  @Post('detect-os')
  @Roles(UserRole.ADMIN)
  async detectOS(@Body() body: { ipv4: string; sshUser?: string }) {
    return this.detectionService.detectOS(body.ipv4, body.sshUser || 'root');
  }

  /**
   * Check server requirements
   */
  @Post('check-requirements')
  @Roles(UserRole.ADMIN)
  async checkRequirements(@Body() body: { ipv4: string; sshUser?: string }) {
    return this.detectionService.checkRequirements(body.ipv4, body.sshUser || 'root');
  }

  /**
   * Auto-configure remote server
   */
  @Post('auto-configure')
  @Roles(UserRole.ADMIN)
  async autoConfigure(
    @Body() body: {
      ipv4: string;
      sshUser?: string;
      name: string;
      city: string;
      country: string;
      countryCode: string;
      wgPort?: number;
    },
    @Request() req
  ) {
    return this.autoConfigService.autoConfigureServer(
      body.ipv4,
      body.sshUser || 'root',
      {
        name: body.name,
        city: body.city,
        country: body.country,
        countryCode: body.countryCode,
        wgPort: body.wgPort || 51820,
      }
    );
  }
}

