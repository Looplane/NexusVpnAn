import { Controller, Post, Get, Body, Param, UseGuards, Request, Patch } from '@nestjs/common';
import { SupportService } from './support.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('support')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post('tickets')
  createTicket(@Request() req, @Body() body: { subject: string; message: string; priority: 'low'|'medium'|'high' }) {
    return this.supportService.createTicket(req.user.userId, body.subject, body.message, body.priority);
  }

  @Get('tickets')
  getUserTickets(@Request() req) {
    const isAdmin = req.user.role === 'admin';
    return this.supportService.getTickets(req.user.userId, isAdmin);
  }

  @Get('tickets/:id/messages')
  getMessages(@Request() req, @Param('id') id: string) {
    const isAdmin = req.user.role === 'admin';
    return this.supportService.getMessages(id, req.user.userId, isAdmin);
  }

  @Post('tickets/:id/reply')
  reply(@Request() req, @Param('id') id: string, @Body('message') message: string) {
    const role = req.user.role;
    return this.supportService.reply(id, req.user.userId, role, message);
  }

  @Patch('tickets/:id/close')
  closeTicket(@Param('id') id: string) {
      return this.supportService.closeTicket(id);
  }
}