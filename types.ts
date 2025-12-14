

export interface User {
  id: string;
  email: string;
  name: string;
  fullName?: string;
  plan: 'free' | 'basic' | 'pro';
  role: 'user' | 'admin';
  isActive?: boolean;
  isTwoFactorEnabled?: boolean;
  createdAt?: string;
  referralCode?: string;
  referralCount?: number;
  credits?: number; // Store credit in cents
  avatarUrl?: string;
  timezone?: string;
  // New Fields
  phoneNumber?: string;
  bio?: string;
  language?: string;
  company?: string;
}

export interface ServerLocation {
  id: string;
  name: string; 
  city: string;
  country: string;
  countryCode: string; 
  ping: number;
  load: number;
  premium: boolean;
  ipv4?: string;
}

export interface VpnConfig {
  id: string;
  name: string;
  createdAt: string;
  publicKey: string;
  assignedIp?: string;
  locationId?: string;
}

export interface BillingInvoice {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  planName: string;
  pdfUrl?: string;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  actorId: string;
  actorEmail?: string;
  targetId?: string;
  details?: string;
  createdAt: string;
  ipAddress?: string;
  location?: string; // New
  device?: string; // New
  userAgent?: string; // New
  severity?: 'info' | 'warning' | 'critical';
}

export interface SystemSetting {
  key: string;
  value: string;
  description: string;
  category?: 'general' | 'security' | 'mail' | 'billing';
}

export interface Ticket {
  id: string;
  subject: string;
  status: 'open' | 'answered' | 'closed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
  userId: string;
  userEmail?: string; 
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderRole: 'user' | 'admin' | 'system';
  message: string;
  createdAt: string;
}

export interface ConnectionLog {
  id: string;
  serverId: string;
  serverCity: string;
  connectedAt: string;
  disconnectedAt?: string;
  duration?: string;
  dataTransferred: string;
  device: string;
}

export interface ActiveSession {
  id: string;
  ipAddress: string;
  deviceType: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
  browser?: string;
  os?: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountPercent: number;
  maxUses: number;
  usedCount: number;
  expiresAt: string;
  isActive: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
}

export interface ReferralStats {
  totalInvited: number;
  totalEarned: number;
  pendingInvites: number;
}

export interface Referral {
    email: string;
    createdAt: string;
    isActive: boolean;
    plan: string;
}

export interface Campaign {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'ended';
  clicks: number;
  conversions: number;
  spend: number;
  roi: number;
}

// --- NEW DEVELOPER TYPES ---

export interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  createdAt: string;
  lastUsedAt?: string;
  scopes: ('read' | 'write' | 'admin')[];
  status: 'active' | 'revoked';
  rateLimit: number; // New: Requests per minute
  usageCount: number; // New
}

export interface WebhookEndpoint {
  id: string;
  url: string;
  events: string[];
  isActive: boolean;
  secret: string; // HMAC secret
  createdAt: string;
  failureCount: number;
  lastTriggeredAt?: string; // New
}

export interface LoginHistory {
  id: string;
  ip: string;
  location: string;
  device: string;
  timestamp: string;
  status: 'success' | 'failed';
}

export const PLANS = {
  free: { name: 'Free Starter', bandwidth: '10GB', devices: 1, price: 0 },
  basic: { name: 'Basic Secure', bandwidth: 'Unlimited', devices: 5, price: 5 },
  pro: { name: 'Pro Privacy', bandwidth: 'Unlimited', devices: 10, price: 10 },
};

export type ToastType = 'success' | 'error' | 'info' | 'warning';
