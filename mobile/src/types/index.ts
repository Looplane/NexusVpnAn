// User Types
export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'user' | 'admin';
  plan: 'free' | 'basic' | 'pro';
  isActive: boolean;
  twoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

// Server/Location Types
export interface ServerLocation {
  id: string;
  name: string;
  city: string;
  country: string;
  countryCode: string;
  ipv4: string;
  ipv6?: string;
  publicKey?: string;
  wgPort: number;
  sshUser: string;
  load: number;
  ping: number;
  premium: boolean;
  isActive: boolean;
  createdAt: string;
}

// VPN Config Types
export interface VpnConfig {
  id: string;
  userId: string;
  name: string;
  locationId: string;
  publicKey: string;
  assignedIp: string;
  config: string;
  qrCode?: string;
  createdAt: string;
}

// Device Types
export interface Device {
  id: string;
  name: string;
  type: 'desktop' | 'mobile' | 'tablet' | 'other';
  lastSeen: string;
  isActive: boolean;
  configId: string;
}

// Usage Types
export interface UsageRecord {
  id: string;
  userId: string;
  recordDate: string;
  bytesUploaded: string;
  bytesDownloaded: string;
  totalBytes: string;
}

export interface UsageStats {
  today: UsageRecord;
  week: UsageRecord;
  month: UsageRecord;
  total: UsageRecord;
  history: UsageRecord[];
}

// Connection Log Types
export interface ConnectionLog {
  id: string;
  userId: string;
  serverId: string;
  serverName: string;
  action: 'connect' | 'disconnect';
  duration?: number;
  bytesTransferred?: string;
  timestamp: string;
}

// Support Types
export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  updatedAt: string;
  messages: TicketMessage[];
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  userId: string;
  message: string;
  isAdmin: boolean;
  createdAt: string;
}

// Referral Types
export interface Referral {
  id: string;
  referrerId: string;
  referredEmail: string;
  status: 'pending' | 'completed';
  reward: number;
  createdAt: string;
}

export interface ReferralStats {
  totalReferrals: number;
  completedReferrals: number;
  totalRewards: number;
  referralCode: string;
  referrals: Referral[];
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Navigation Types
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  TwoFactor: { token?: string; email?: string };
  Dashboard: undefined;
  ServerSelection: { onSelect?: (server: ServerLocation) => void };
  Settings: undefined;
  DataUsage: undefined;
  Devices: undefined;
  ConfigDetails: { configId: string };
  ConnectionHistory: undefined;
  Support: undefined;
  Referrals: undefined;
};

