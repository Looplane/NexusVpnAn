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
  async detectOS(@Body() body: { ipv4: string; sshUser?: string; sshPassword?: string }) {
    return this.detectionService.detectOS(body.ipv4, body.sshUser || 'root', body.sshPassword);
  }

  /**
   * Check server requirements
   */
  @Post('check-requirements')
  @Roles(UserRole.ADMIN)
  async checkRequirements(@Body() body: { ipv4: string; sshUser?: string; sshPassword?: string }) {
    return this.detectionService.checkRequirements(body.ipv4, body.sshUser || 'root', undefined, body.sshPassword);
  }

  /**
   * Get comprehensive server fingerprint
   */
  @Post('fingerprint')
  @Roles(UserRole.ADMIN)
  async getFingerprint(@Body() body: { ipv4: string; sshUser?: string; sshPassword?: string }) {
    return this.detectionService.getServerFingerprint(body.ipv4, body.sshUser || 'root', body.sshPassword);
  }

  /**
   * Fetch WireGuard config from remote server
   */
  @Post('fetch-wg-config')
  @Roles(UserRole.ADMIN)
  async fetchWireGuardConfig(@Body() body: { ipv4: string; sshUser?: string; sshPassword?: string }) {
    const config = await this.detectionService.fetchWireGuardConfig(body.ipv4, body.sshUser || 'root', body.sshPassword);
    return { config, success: !!config };
  }

  /**
   * Parse WireGuard config file
   */
  @Post('parse-wg-config')
  @Roles(UserRole.ADMIN)
  async parseWireGuardConfig(@Body() body: { config: string }) {
    const parsed: any = {};
    const config = body.config;

    // Parse Interface section
    const interfaceMatch = config.match(/\[Interface\]([\s\S]*?)(?=\[|$)/i);
    if (interfaceMatch) {
      const interfaceSection = interfaceMatch[1];
      const privateKeyMatch = interfaceSection.match(/PrivateKey\s*=\s*([^\s]+)/i);
      const addressMatch = interfaceSection.match(/Address\s*=\s*([^\s]+)/i);
      const listenPortMatch = interfaceSection.match(/ListenPort\s*=\s*(\d+)/i);
      const dnsMatch = interfaceSection.match(/DNS\s*=\s*([^\n]+)/i);

      if (addressMatch) parsed.interfaceIP = addressMatch[1].trim();
      if (listenPortMatch) parsed.listenPort = parseInt(listenPortMatch[1], 10);
      if (dnsMatch) parsed.dns = dnsMatch[1].trim();
    }

    // Parse Peer section (for client configs)
    const peerMatch = config.match(/\[Peer\]([\s\S]*?)(?=\[|$)/i);
    if (peerMatch) {
      const peerSection = peerMatch[1];
      const publicKeyMatch = peerSection.match(/PublicKey\s*=\s*([^\s]+)/i);
      const endpointMatch = peerSection.match(/Endpoint\s*=\s*([^\s:]+):(\d+)/i);
      const allowedIPsMatch = peerSection.match(/AllowedIPs\s*=\s*([^\n]+)/i);

      if (publicKeyMatch) parsed.publicKey = publicKeyMatch[1].trim();
      if (endpointMatch) {
        parsed.endpointIP = endpointMatch[1].trim();
        parsed.endpointPort = parseInt(endpointMatch[2], 10);
      }
      if (allowedIPsMatch) parsed.allowedIPs = allowedIPsMatch[1].trim();
    }

    return { parsed, success: true };
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
      sshPassword?: string;
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
        sshPassword: body.sshPassword, // Store password in server record
      },
      body.sshPassword
    );
  }
}

