import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, MessageCircle, Send, Plus } from 'lucide-react-native';
import { apiClient } from '../services/apiClient';
import { SupportTicket, TicketMessage } from '../types';
import { Button } from '../components/UI';

export default function SupportScreen({ navigation }: any) {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [newTicketSubject, setNewTicketSubject] = useState('');

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      setIsLoading(true);
      // Note: Support API endpoints need to be added to backend
      // For now, using placeholder
      setTickets([]);
    } catch (e: any) {
      console.error('Failed to load tickets:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTickets();
    setRefreshing(false);
  };

  const handleCreateTicket = async () => {
    if (!newTicketSubject.trim()) {
      Alert.alert('Error', 'Please enter a subject');
      return;
    }
    // In production, call: await apiClient.createTicket(newTicketSubject);
    Alert.alert('Success', 'Ticket created (mock)');
    setShowNewTicket(false);
    setNewTicketSubject('');
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedTicket) return;
    // In production, call: await apiClient.sendTicketMessage(selectedTicket.id, newMessage);
    setNewMessage('');
    Alert.alert('Success', 'Message sent (mock)');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return '#0ea5e9';
      case 'in_progress': return '#f59e0b';
      case 'resolved': return '#10b981';
      default: return '#64748b';
    }
  };

  if (selectedTicket) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setSelectedTicket(null)} style={styles.backButton}>
            <ArrowLeft size={20} color="#94a3b8" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{selectedTicket.subject}</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.messagesContainer}>
          {selectedTicket.messages.map((msg) => (
            <View
              key={msg.id}
              style={[
                styles.message,
                msg.isAdmin ? styles.adminMessage : styles.userMessage
              ]}
            >
              <Text style={styles.messageText}>{msg.message}</Text>
              <Text style={styles.messageTime}>
                {new Date(msg.createdAt).toLocaleString()}
              </Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type your message..."
            placeholderTextColor="#64748b"
            multiline
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSendMessage}
            disabled={!newMessage.trim()}
          >
            <Send size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (showNewTicket) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setShowNewTicket(false)} style={styles.backButton}>
            <ArrowLeft size={20} color="#94a3b8" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Ticket</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.formContainer}>
          <View style={styles.form}>
            <Text style={styles.label}>Subject</Text>
            <TextInput
              style={styles.textInput}
              value={newTicketSubject}
              onChangeText={setNewTicketSubject}
              placeholder="What can we help you with?"
              placeholderTextColor="#64748b"
            />
            <Button
              title="Create Ticket"
              onPress={handleCreateTicket}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={20} color="#94a3b8" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Support</Text>
        <TouchableOpacity
          onPress={() => setShowNewTicket(true)}
          style={styles.addButton}
        >
          <Plus size={20} color="#0ea5e9" />
        </TouchableOpacity>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#0ea5e9" />
        }
      >
        {tickets.length === 0 ? (
          <View style={styles.empty}>
            <MessageCircle size={48} color="#64748b" />
            <Text style={styles.emptyText}>No support tickets</Text>
            <Text style={styles.emptySubtext}>
              Create a ticket to get help
            </Text>
            <Button
              title="Create Ticket"
              onPress={() => setShowNewTicket(true)}
              style={{ marginTop: 20 }}
            />
          </View>
        ) : (
          tickets.map((ticket) => (
            <TouchableOpacity
              key={ticket.id}
              style={styles.ticketCard}
              onPress={() => setSelectedTicket(ticket)}
            >
              <View style={styles.ticketHeader}>
                <Text style={styles.ticketSubject}>{ticket.subject}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(ticket.status) }]}>
                  <Text style={styles.statusText}>{ticket.status}</Text>
                </View>
              </View>
              <Text style={styles.ticketDate}>
                {new Date(ticket.createdAt).toLocaleDateString()}
              </Text>
              <Text style={styles.ticketPreview}>
                {ticket.messages[0]?.message || 'No messages yet'}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  placeholder: {
    width: 40,
  },
  addButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  ticketCard: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ticketSubject: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'uppercase',
  },
  ticketDate: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 8,
  },
  ticketPreview: {
    fontSize: 14,
    color: '#94a3b8',
  },
  messagesContainer: {
    flex: 1,
    padding: 20,
  },
  message: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    maxWidth: '80%',
  },
  userMessage: {
    backgroundColor: '#0ea5e9',
    alignSelf: 'flex-end',
  },
  adminMessage: {
    backgroundColor: '#1e293b',
    alignSelf: 'flex-start',
  },
  messageText: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 4,
  },
  messageTime: {
    fontSize: 10,
    color: '#94a3b8',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 12,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#334155',
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    backgroundColor: '#0ea5e9',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    flex: 1,
    padding: 20,
  },
  form: {
    gap: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94a3b8',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#334155',
  },
});

