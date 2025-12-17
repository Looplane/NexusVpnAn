import { Controller, Post, Get, Body, Param, UseGuards, Request, Patch, ValidationPipe, Query, Version } from '@nestjs/common';
import { SupportService } from './support.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { ReplyTicketDto } from './dto/reply-ticket.dto';

@Controller({ path: 'support', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post('tickets')
  createTicket(
    @Request() req,
    @Body(new ValidationPipe()) createTicketDto: CreateTicketDto,
  ) {
    return this.supportService.createTicket(
      req.user.userId,
      createTicketDto.subject,
      createTicketDto.message,
      createTicketDto.priority,
    );
  }

  @Get('tickets')
  getUserTickets(
    @Request() req,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const isAdmin = req.user.role === 'admin';
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.supportService.getTickets(req.user.userId, isAdmin, pageNum, limitNum);
  }

  @Get('tickets/:id/messages')
  getMessages(@Request() req, @Param('id') id: string) {
    const isAdmin = req.user.role === 'admin';
    return this.supportService.getMessages(id, req.user.userId, isAdmin);
  }

  @Post('tickets/:id/reply')
  reply(
    @Request() req,
    @Param('id') id: string,
    @Body(new ValidationPipe()) replyDto: ReplyTicketDto,
  ) {
    const role = req.user.role;
    return this.supportService.reply(id, req.user.userId, role, replyDto.message);
  }

  @Patch('tickets/:id/close')
  closeTicket(@Param('id') id: string) {
    return this.supportService.closeTicket(id);
  }
}