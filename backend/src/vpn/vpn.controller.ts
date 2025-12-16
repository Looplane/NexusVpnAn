import { Controller, Post, Get, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { VpnService } from './vpn.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GenerateConfigDto } from './dto/generate-config.dto';

@Controller('vpn')
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
}