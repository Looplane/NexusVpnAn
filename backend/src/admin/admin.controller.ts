
import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CampaignService } from './campaign.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(
      private readonly adminService: AdminService,
      private readonly campaignService: CampaignService
  ) {}

  @Get('stats')
  @Roles(UserRole.ADMIN)
  getStats() {
    return this.adminService.getStats();
  }

  @Get('campaigns')
  @Roles(UserRole.ADMIN)
  getCampaigns() {
      return this.campaignService.findAll();
  }

  // --- Servers ---

  @Post('servers')
  @Roles(UserRole.ADMIN)
  addServer(@Body() body: any, @Request() req) {
    return this.adminService.addServer(body, req.user.userId);
  }

  @Delete('servers/:id')
  @Roles(UserRole.ADMIN)
  removeServer(@Param('id') id: string, @Request() req) {
    return this.adminService.removeServer(id, req.user.userId);
  }

  @Get('servers/:id/setup-script')
  @Roles(UserRole.ADMIN)
  async getSetupScript(@Param('id') id: string) {
      const script = await this.adminService.generateSetupScript(id);
      return { script };
  }

  @Post('servers/:id/command')
  @Roles(UserRole.ADMIN)
  async executeCommand(@Param('id') id: string, @Body('command') command: string) {
      const output = await this.adminService.executeServerCommand(id, command);
      return { output };
  }

  @Get('servers/:id/metrics')
  @Roles(UserRole.ADMIN)
  async getServerMetrics(@Param('id') id: string) {
      return this.adminService.getServerMetrics(id);
  }

  @Get('servers/:id/logs')
  @Roles(UserRole.ADMIN)
  async getServerLogs(@Param('id') id: string, @Query('lines') lines?: number) {
      return this.adminService.getServerLogs(id, lines || 50);
  }

  @Post('servers/:id/service/:action')
  @Roles(UserRole.ADMIN)
  async controlService(@Param('id') id: string, @Param('action') action: 'start' | 'stop' | 'restart' | 'status') {
      return this.adminService.controlWireGuardService(id, action);
  }

  @Get('servers/:id/firewall')
  @Roles(UserRole.ADMIN)
  async getFirewallRules(@Param('id') id: string) {
      return this.adminService.getFirewallRules(id);
  }

  @Post('servers/:id/firewall')
  @Roles(UserRole.ADMIN)
  async addFirewallRule(@Param('id') id: string, @Body() body: { port: string; protocol?: string; description?: string }) {
      return this.adminService.addFirewallRule(id, body.port, body.protocol || 'TCP', body.description);
  }

  @Delete('servers/:id/firewall/:ruleId')
  @Roles(UserRole.ADMIN)
  async deleteFirewallRule(@Param('id') id: string, @Param('ruleId') ruleId: string, @Query('port') port?: string, @Query('protocol') protocol?: string) {
      return this.adminService.deleteFirewallRule(id, ruleId, port, protocol);
  }

  @Get('servers/:id/config')
  @Roles(UserRole.ADMIN)
  async getWireGuardConfig(@Param('id') id: string) {
      return this.adminService.getWireGuardConfig(id);
  }

  @Patch('servers/:id/config')
  @Roles(UserRole.ADMIN)
  async updateWireGuardConfig(@Param('id') id: string, @Body() config: any) {
      return this.adminService.updateWireGuardConfig(id, config);
  }

  // --- Users ---

  @Get('users')
  @Roles(UserRole.ADMIN)
  getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Patch('users/:id')
  @Roles(UserRole.ADMIN)
  updateUser(@Param('id') id: string, @Body() body: any, @Request() req) {
    return this.adminService.updateUser(id, body, req.user.userId);
  }

  @Delete('users/:id')
  @Roles(UserRole.ADMIN)
  deleteUser(@Param('id') id: string, @Request() req) {
    return this.adminService.deleteUser(id, req.user.userId);
  }

  // --- Audit & Settings ---

  @Get('audit')
  @Roles(UserRole.ADMIN)
  getAuditLogs() {
    return this.adminService.getAuditLogs();
  }

  @Get('settings')
  @Roles(UserRole.ADMIN)
  getSettings() {
    return this.adminService.getSettings();
  }

  @Patch('settings/:key')
  @Roles(UserRole.ADMIN)
  updateSetting(@Param('key') key: string, @Body('value') value: string, @Request() req) {
    return this.adminService.updateSetting(key, value, req.user.userId);
  }
}