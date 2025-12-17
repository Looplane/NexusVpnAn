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

  async getTickets(userId: string, isAdmin = false, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    
    if (isAdmin) {
      const [tickets, total] = await this.ticketRepo.findAndCount({ 
        order: { updatedAt: 'DESC' },
        relations: ['user'], // To get email for admin view
        skip,
        take: limit,
      });
      return {
        tickets,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }
    
    const [tickets, total] = await this.ticketRepo.findAndCount({ 
      where: { userId }, 
      order: { updatedAt: 'DESC' },
      skip,
      take: limit,
    });
    
    return {
      tickets,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getMessages(ticketId: string, userId: string, isAdmin = false) {
    // Use query builder for better performance with relations
    const ticket = await this.ticketRepo
      .createQueryBuilder('ticket')
      .where('ticket.id = :ticketId', { ticketId })
      .getOne();
      
    if (!ticket) throw new NotFoundException('Ticket not found');
    
    if (!isAdmin && ticket.userId !== userId) {
      throw new NotFoundException('Ticket not found');
    }

    // Optimized query with proper ordering
    return this.messageRepo.find({
      where: { ticketId },
      order: { createdAt: 'ASC' },
      // Add relations if needed in future (e.g., sender info)
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