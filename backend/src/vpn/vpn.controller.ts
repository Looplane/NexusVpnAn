import { Controller, Post, Get, Delete, Body, Param, UseGuards, Request, Version } from '@nestjs/common';
import { VpnService } from './vpn.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GenerateConfigDto } from './dto/generate-config.dto';

@Controller({ path: 'vpn', version: '1' })
export class VpnController {
  constructor(private readonly vpnService: VpnService) {}

  @UseGuards(JwtAuthGuard)
  @Post('config')
  async generateConfig(@Request() req, @Body() dto: GenerateConfigDto) {
    // req.user is populated by JwtAuthGuard
    const config = await this.vpnService.generateConfig(req.user.userId, dto);
    return { config };
  }

  @UseGuards(JwtAuthGuard)
  @Get('devices')
  async getUserDevices(@Request() req) {
    return this.vpnService.getUserConfigs(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('devices/:id')
  async revokeDevice(@Request() req, @Param('id') configId: string) {
    await this.vpnService.revokeConfig(req.user.userId, configId);
    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get('logs')
  async getConnectionLogs(@Request() req) {
    return this.vpnService.getConnectionLogs(req.user.userId);
  }

  /**
   * Run speed test
   * 
   * Performs network speed test to measure download, upload, ping, and jitter.
   * Currently returns simulated results. In production, this should integrate with
   * a real speed test service (e.g., Speedtest.net API, custom implementation).
   * 
   * @returns Speed test results (download, upload, ping, jitter, packet loss)
   * 
   * @todo Integrate with real speed test service (Speedtest.net, Fast.com API, etc.)
   * @todo Add server selection for testing against specific VPN nodes
   * @todo Cache results to avoid excessive API calls
   */
  @UseGuards(JwtAuthGuard)
  @Get('speed-test')
  async runSpeedTest(@Request() req) {
    // TODO: Implement real speed test
    // Options:
    // 1. Integrate with Speedtest.net API (requires API key)
    // 2. Use Fast.com API (free, no key required)
    // 3. Custom implementation using iperf3 on VPN servers
    // 4. Use third-party service like Cloudflare Speed Test API
    
    // For now, return simulated results based on user's current connection
    // In production, this should make actual network measurements
    const simulatedResults = {
      download: Math.floor(Math.random() * 200) + 800, // Mbps
      upload: Math.floor(Math.random() * 100) + 600,   // Mbps
      ping: Math.floor(Math.random() * 20) + 10,       // ms
      jitter: Math.floor(Math.random() * 5) + 1,       // ms
      loss: Math.random() < 0.1 ? Math.random() * 0.5 : 0, // packet loss %
      timestamp: new Date().toISOString(),
      server: 'auto', // Could be server ID for testing specific VPN node
    };
    
    return simulatedResults;
  }
}