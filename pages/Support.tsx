
import React, { useEffect, useState, useRef } from 'react';
import { apiClient } from '../services/apiClient';
import { Ticket, TicketMessage } from '../types';
import { Card, Button, Input, Badge, Modal } from '../components/UI';
import { MessageSquare, Plus, Send, Clock, AlertCircle } from 'lucide-react';
import { useToast } from '../contexts';

export const Support: React.FC = () => {
  const { addToast } = useToast();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  // New Ticket State
  const [showNewModal, setShowNewModal] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newInitialMsg, setNewInitialMsg] = useState('');
  const [newPriority, setNewPriority] = useState('medium');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
      if(selectedTicket) fetchMessages(selectedTicket.id);
  }, [selectedTicket]);

  useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
        const data = await apiClient.getTickets();
        setTickets(data);
    } catch(e) {
        addToast('error', 'Failed to load tickets');
    } finally {
        setIsLoading(false);
    }
  };

  const fetchMessages = async (ticketId: string) => {
      try {
          const msgs = await apiClient.getTicketMessages(ticketId);
          setMessages(msgs);
      } catch(e) {
          addToast('error', 'Failed to load messages');
      }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
          const t = await apiClient.createTicket(newSubject, newInitialMsg, newPriority);
          addToast('success', 'Ticket created');
          setTickets([t, ...tickets]);
          setShowNewModal(false);
          setNewSubject('');
          setNewInitialMsg('');
          setSelectedTicket(t);
      } catch(e) {
          addToast('error', 'Failed to create ticket');
      }
  };

  const handleReply = async (e: React.FormEvent) => {
      e.preventDefault();
      if(!selectedTicket || !newMessage.trim()) return;
      setIsSending(true);
      try {
          const msg = await apiClient.replyTicket(selectedTicket.id, newMessage);
          setMessages([...messages, msg]);
          setNewMessage('');
      } catch(e) {
          addToast('error', 'Failed to send message');
      } finally {
          setIsSending(false);
      }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 h-[calc(100vh-80px)]">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Support Center</h1>
          <p className="text-slate-500">Track and manage your support requests.</p>
        </div>
        <Button onClick={() => setShowNewModal(true)}>
            <Plus size={18} className="mr-2" /> New Ticket
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100%-80px)]">
        {/* Ticket List */}
        <Card className="col-span-1 overflow-y-auto border-r border-slate-200 dark:border-slate-800 p-0">
             {isLoading ? (
                 <div className="p-6 text-center text-slate-500">Loading tickets...</div>
             ) : tickets.length === 0 ? (
                 <div className="p-6 text-center text-slate-500">
                     <MessageSquare size={48} className="mx-auto mb-4 opacity-20" />
                     <p>No tickets found.</p>
                 </div>
             ) : (
                 <div className="divide-y divide-slate-200 dark:divide-slate-800">
                     {tickets.map(t => (
                         <div 
                            key={t.id} 
                            onClick={() => setSelectedTicket(t)}
                            className={`p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${selectedTicket?.id === t.id ? 'bg-slate-100 dark:bg-slate-800 border-l-4 border-brand-500' : ''}`}
                         >
                             <div className="flex justify-between items-start mb-1">
                                 <h3 className={`font-medium truncate ${selectedTicket?.id === t.id ? 'text-brand-600 dark:text-brand-400' : 'text-slate-900 dark:text-white'}`}>{t.subject}</h3>
                                 <span className="text-xs text-slate-400 whitespace-nowrap ml-2">{new Date(t.updatedAt).toLocaleDateString()}</span>
                             </div>
                             <div className="flex justify-between items-center">
                                 <div className="flex space-x-2">
                                     <Badge variant={t.status === 'open' ? 'neutral' : t.status === 'answered' ? 'warning' : 'success'}>{t.status}</Badge>
                                     <Badge variant="neutral">{t.priority}</Badge>
                                 </div>
                             </div>
                         </div>
                     ))}
                 </div>
             )}
        </Card>

        {/* Ticket Detail & Chat */}
        <Card className="col-span-2 flex flex-col h-full overflow-hidden">
            {selectedTicket ? (
                <>
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
                        <div>
                            <h2 className="font-bold text-lg text-slate-900 dark:text-white">{selectedTicket.subject}</h2>
                            <p className="text-xs text-slate-500">Ticket ID: {selectedTicket.id}</p>
                        </div>
                        <Badge variant={selectedTicket.status === 'closed' ? 'success' : 'neutral'}>{selectedTicket.status}</Badge>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map(m => (
                            <div key={m.id} className={`flex ${m.senderRole === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-lg p-3 ${
                                    m.senderRole === 'user' 
                                    ? 'bg-brand-600 text-white rounded-br-none' 
                                    : 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-none'
                                }`}>
                                    <p className="text-sm whitespace-pre-wrap">{m.message}</p>
                                    <div className={`text-[10px] mt-1 ${m.senderRole === 'user' ? 'text-brand-200' : 'text-slate-500'} text-right`}>
                                        {new Date(m.createdAt).toLocaleTimeString()} • {m.senderRole === 'admin' ? 'Support Agent' : 'You'}
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                        {selectedTicket.status === 'closed' ? (
                            <div className="text-center text-slate-500 text-sm">This ticket is closed. You cannot reply.</div>
                        ) : (
                            <form onSubmit={handleReply} className="flex space-x-2">
                                <Input 
                                    placeholder="Type your reply..." 
                                    value={newMessage} 
                                    onChange={e => setNewMessage(e.target.value)}
                                    className="flex-1"
                                />
                                <Button type="submit" isLoading={isSending} disabled={!newMessage.trim()}>
                                    <Send size={18} />
                                </Button>
                            </form>
                        )}
                    </div>
                </>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-500">
                    <MessageSquare size={64} className="mb-4 opacity-10" />
                    <p>Select a ticket to view conversation</p>
                </div>
            )}
        </Card>
      </div>

      <Modal isOpen={showNewModal} onClose={() => setShowNewModal(false)} title="Create Support Ticket">
          <form onSubmit={handleCreateTicket} className="space-y-4">
              <Input label="Subject" value={newSubject} onChange={e => setNewSubject(e.target.value)} required placeholder="Brief summary of issue" />
              <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Priority</label>
                  <select 
                    value={newPriority} 
                    onChange={e => setNewPriority(e.target.value)}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white"
                  >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                  </select>
              </div>
              <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Message</label>
                  <textarea 
                    value={newInitialMsg} 
                    onChange={e => setNewInitialMsg(e.target.value)}
                    required
                    rows={4}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-500"
                    placeholder="Describe your issue in detail..."
                  ></textarea>
              </div>
              <div className="pt-2">
                  <Button type="submit" className="w-full">Submit Ticket</Button>
              </div>
          </form>
      </Modal>
    </div>
  );
};
