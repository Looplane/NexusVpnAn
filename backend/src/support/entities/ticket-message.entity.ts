import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Ticket } from './ticket.entity';

@Entity('ticket_messages')
export class TicketMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  ticketId: string;

  @ManyToOne(() => Ticket)
  @JoinColumn({ name: 'ticketId' })
  ticket: Ticket;

  @Column()
  senderId: string;

  @Column()
  senderRole: 'user' | 'admin' | 'system';

  @Column({ type: 'text' })
  message: string;

  @Index()
  @CreateDateColumn()
  createdAt: Date;
}