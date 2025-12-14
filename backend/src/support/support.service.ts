import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from './entities/ticket.entity';
import { TicketMessage } from './entities/ticket-message.entity';
import { EmailService } from '../notifications/email.service';

@Injectable()
export class SupportService {
  constructor(
    @InjectRepository(Ticket) private ticketRepo: Repository<Ticket>,
    @InjectRepository(TicketMessage) private messageRepo: Repository<TicketMessage>,
    private emailService: EmailService,
  ) {}

  async createTicket(userId: string, subject: string, message: string, priority: 'low'|'medium'|'high') {
    const ticket = this.ticketRepo.create({
      userId,
      subject,
      priority,
      status: 'open',
    });
    const savedTicket = await this.ticketRepo.save(ticket);
    
    // Create initial message
    const msg = this.messageRepo.create({
      ticketId: savedTicket.id,
      senderId: userId,
      senderRole: 'user',
      message,
    });
    await this.messageRepo.save(msg);
    
    return savedTicket;
  }

  async getTickets(userId: string, isAdmin = false) {
    if (isAdmin) {
      return this.ticketRepo.find({ 
        order: { updatedAt: 'DESC' },
        relations: ['user'] // To get email for admin view
      });
    }
    return this.ticketRepo.find({ 
      where: { userId }, 
      order: { updatedAt: 'DESC' } 
    });
  }

  async getMessages(ticketId: string, userId: string, isAdmin = false) {
    const ticket = await this.ticketRepo.findOne({ where: { id: ticketId } });
    if (!ticket) throw new NotFoundException('Ticket not found');
    
    if (!isAdmin && ticket.userId !== userId) {
      throw new NotFoundException('Ticket not found');
    }

    return this.messageRepo.find({
      where: { ticketId },
      order: { createdAt: 'ASC' },
    });
  }

  async reply(ticketId: string, senderId: string, senderRole: 'user'|'admin', message: string) {
     const ticket = await this.ticketRepo.findOne({ where: { id: ticketId }, relations: ['user'] });
     if (!ticket) throw new NotFoundException('Ticket not found');

     const msg = this.messageRepo.create({
         ticketId,
         senderId,
         senderRole,
         message
     });
     await this.messageRepo.save(msg);

     // Update ticket status
     ticket.status = senderRole === 'admin' ? 'answered' : 'open';
     await this.ticketRepo.save(ticket);

     return msg;
  }

  async closeTicket(ticketId: string) {
      const ticket = await this.ticketRepo.findOne({ where: { id: ticketId } });
      if(ticket) {
          ticket.status = 'closed';
          await this.ticketRepo.save(ticket);
      }
      return ticket;
  }
}