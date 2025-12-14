

import { ServerLocation, User, BillingInvoice, VpnConfig, AuditLogEntry, SystemSetting, Ticket, TicketMessage, ConnectionLog, ActiveSession, Coupon, Notification, ReferralStats, Campaign, ApiKey, WebhookEndpoint, LoginHistory } from '../types';

// Mock Data (Existing preserved)
let LOCATIONS: ServerLocation[] = [
  { id: 'us-east', name: 'US East Node', city: 'New York', country: 'United States', countryCode: 'US', ping: 24, load: 45, premium: false, ipv4: '104.16.0.1' },
  { id: 'us-west', name: 'US West Node', city: 'Los Angeles', country: 'United States', countryCode: 'US', ping: 56, load: 30, premium: false, ipv4: '104.16.0.2' },
  { id: 'eu-de', name: 'EU Central Node', city: 'Frankfurt', country: 'Germany', countryCode: 'DE', ping: 112, load: 60, premium: false, ipv4: '172.67.0.1' },
  { id: 'asia-jp', name: 'Asia Pacific Node', city: 'Tokyo', country: 'Japan', countryCode: 'JP', ping: 180, load: 25, premium: true, ipv4: '172.67.0.2' },
  { id: 'eu-uk', name: 'UK South Node', city: 'London', country: 'United Kingdom', countryCode: 'GB', ping: 105, load: 55, premium: true, ipv4: '104.21.0.1' },
  { id: 'au-syd', name: 'Oceania Node', city: 'Sydney', country: 'Australia', countryCode: 'AU', ping: 210, load: 15, premium: true, ipv4: '104.21.0.2' },
  { id: 'ca-tor', name: 'Canada Node', city: 'Toronto', country: 'Canada', countryCode: 'CA', ping: 45, load: 40, premium: false, ipv4: '172.67.0.3' },
];

let MOCK_USER: User = {
  id: 'u-123456',
  email: 'demo@nexusvpn.com',
  name: 'Demo User',
  fullName: 'Demo User',
  plan: 'free',
  role: 'user',
  isTwoFactorEnabled: false,
  referralCode: 'DEMO2024',
  referralCount: 3,
  credits: 1500,
  avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  timezone: 'UTC',
  phoneNumber: '+1 (555) 123-4567',
  bio: 'Privacy enthusiast and developer.',
  language: 'English',
  company: 'Nexus Inc.'
};

let MOCK_DEVICES: VpnConfig[] = [
  { id: 'dev-1', name: 'iPhone 15 Pro', createdAt: new Date().toISOString(), publicKey: 'mock-key-1', locationId: 'us-east' },
  { id: 'dev-2', name: 'MacBook Air', createdAt: new Date(Date.now() - 86400000).toISOString(), publicKey: 'mock-key-2', locationId: 'eu-de' }
];

let MOCK_USERS_DB: User[] = [
    MOCK_USER,
    { id: 'u-222', email: 'alice@example.com', name: 'Alice', fullName: 'Alice Wonderland', plan: 'pro', role: 'user', isActive: true, createdAt: '2023-01-15', avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150' },
    { id: 'u-333', email: 'bob@example.com', name: 'Bob', fullName: 'Bob Builder', plan: 'basic', role: 'user', isActive: false, createdAt: '2023-02-20', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' },
    { id: 'u-444', email: 'charlie@example.com', name: 'Charlie', fullName: 'Charlie Chocolate', plan: 'free', role: 'user', isActive: true, createdAt: '2023-03-10' },
    { id: 'u-555', email: 'dave@example.com', name: 'Dave', fullName: 'Dave Diver', plan: 'pro', role: 'user', isActive: true, createdAt: '2023-04-05' },
];

let MOCK_AUDIT_LOGS: AuditLogEntry[] = [
    { id: 'log-1', action: 'USER_LOGIN', actorId: 'u-123456', actorEmail: 'demo@nexusvpn.com', details: 'Login successful via Web', createdAt: new Date().toISOString(), severity: 'info', ipAddress: '192.168.1.5', location: 'New York, US', device: 'Chrome / Windows', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)...' },
    { id: 'log-2', action: 'VPN_KEY_GENERATED', actorId: 'u-123456', actorEmail: 'demo@nexusvpn.com', targetId: 'dev-1', details: 'Location: New York', createdAt: new Date(Date.now() - 100000).toISOString(), severity: 'info', ipAddress: '192.168.1.5', location: 'New York, US', device: 'Chrome / Windows' },
    { id: 'log-3', action: 'SERVER_ADDED', actorId: 'u-123456', actorEmail: 'admin@nexusvpn.com', targetId: 'us-east', details: 'Added server US East Node', createdAt: new Date(Date.now() - 5000000).toISOString(), severity: 'warning', ipAddress: '10.0.0.1', location: 'Internal', device: 'CLI Tool' },
    { id: 'log-4', action: 'SYSTEM_ERROR', actorId: 'system', actorEmail: 'system', details: 'Failed to sync node JP-1', createdAt: new Date(Date.now() - 300000).toISOString(), severity: 'critical', ipAddress: 'localhost', location: 'Server', device: 'System' },
    { id: 'log-5', action: 'SETTINGS_UPDATE', actorId: 'u-123456', actorEmail: 'demo@nexusvpn.com', details: 'Updated billing details', createdAt: new Date(Date.now() - 8000000).toISOString(), severity: 'info', ipAddress: '192.168.1.5', location: 'New York, US', device: 'Chrome / Windows' }
];

let MOCK_SETTINGS: SystemSetting[] = [
    { key: 'maintenance_mode', value: 'false', description: 'Prevent new logins/registrations', category: 'general' },
    { key: 'allow_registration', value: 'true', description: 'Allow new users to sign up', category: 'general' },
    { key: 'max_devices_free', value: '1', description: 'Max devices for free tier', category: 'billing' },
    { key: 'promo_banner', value: 'Spring Sale: 50% OFF Pro Plan!', description: 'Global banner text', category: 'general' },
    { key: 'brand_name', value: 'NexusVPN', description: 'App Name', category: 'general' },
    { key: 'support_email', value: 'support@nexusvpn.com', description: 'Support Contact', category: 'mail' },
    { key: 'require_email_verification', value: 'true', description: 'Require email check on signup', category: 'security' },
    { key: 'smtp_host', value: 'smtp.sendgrid.net', description: 'SMTP Server', category: 'mail' },
    { key: 'enforce_2fa_admin', value: 'true', description: 'Require 2FA for admins', category: 'security' },
    { key: 'stripe_pk', value: 'pk_test_...', description: 'Stripe Public Key', category: 'billing' },
];

let MOCK_CAMPAIGNS: Campaign[] = [
    { id: 'cmp-1', name: 'Spring Sale 2024', status: 'active', clicks: 4520, conversions: 320, spend: 1200, roi: 240 },
    { id: 'cmp-2', name: 'Black Friday Legacy', status: 'ended', clicks: 12500, conversions: 1100, spend: 5000, roi: 310 },
    { id: 'cmp-3', name: 'Influencer Pack A', status: 'paused', clicks: 800, conversions: 12, spend: 400, roi: -20 },
];

let MOCK_API_KEYS: ApiKey[] = [
    { id: 'key-1', name: 'Production Backend', prefix: 'nx_live_...', createdAt: new Date(Date.now() - 10000000).toISOString(), lastUsedAt: new Date().toISOString(), scopes: ['read', 'write'], status: 'active', rateLimit: 1000, usageCount: 45210 },
    { id: 'key-2', name: 'CI/CD Pipeline', prefix: 'nx_test_...', createdAt: new Date(Date.now() - 20000000).toISOString(), lastUsedAt: new Date(Date.now() - 500000).toISOString(), scopes: ['read'], status: 'active', rateLimit: 100, usageCount: 120 },
];

let MOCK_WEBHOOKS: WebhookEndpoint[] = [
    { id: 'wh-1', url: 'https://api.myapp.com/webhooks/vpn', events: ['tunnel.connected', 'tunnel.disconnected'], isActive: true, secret: 'whsec_...', createdAt: new Date().toISOString(), failureCount: 0, lastTriggeredAt: new Date().toISOString() },
];

let MOCK_LOGIN_HISTORY: LoginHistory[] = [
    { id: 'lh-1', ip: '192.168.1.1', location: 'New York, US', device: 'Chrome on Windows', timestamp: new Date().toISOString(), status: 'success' },
    { id: 'lh-2', ip: '10.0.0.5', location: 'London, UK', device: 'Firefox on MacOS', timestamp: new Date(Date.now() - 3600000).toISOString(), status: 'failed' },
    { id: 'lh-3', ip: '192.168.1.1', location: 'New York, US', device: 'Chrome on Windows', timestamp: new Date(Date.now() - 7200000).toISOString(), status: 'success' },
];

// ... (Rest of existing Mock Data: Tickets, Messages, Logs, Sessions, Coupons, Notifications) ...
let MOCK_TICKETS: Ticket[] = [{ id: 't-1', subject: 'Connection issues in China', status: 'answered', priority: 'high', userId: 'u-123456', createdAt: new Date(Date.now() - 86400000).toISOString(), updatedAt: new Date().toISOString() }];
let MOCK_MESSAGES: TicketMessage[] = [{ id: 'm-1', ticketId: 't-1', senderId: 'u-123456', senderRole: 'user', message: 'I cannot connect to the Japan server from Beijing. Is it blocked?', createdAt: new Date(Date.now() - 86400000).toISOString() }];
let MOCK_CONN_LOGS: ConnectionLog[] = [{ id: 'cl-1', serverId: 'us-east', serverCity: 'New York', connectedAt: new Date(Date.now() - 3600000).toISOString(), disconnectedAt: new Date().toISOString(), duration: '1h 0m', dataTransferred: '1.2 GB', device: 'iPhone 15 Pro' }];
let MOCK_SESSIONS: ActiveSession[] = [{ id: 'sess-1', ipAddress: '192.168.1.1', deviceType: 'Chrome on Windows 11', location: 'New York, US', lastActive: 'Now', isCurrent: true, browser: 'Chrome 120', os: 'Windows 11' }];
let MOCK_COUPONS: Coupon[] = [{ id: 'cp-1', code: 'WELCOME20', discountPercent: 20, maxUses: 1000, usedCount: 45, expiresAt: '2025-12-31', isActive: true }];
let MOCK_NOTIFICATIONS: Notification[] = [{ id: 'n-1', title: 'System Maintenance', message: 'Scheduled maintenance on US-East servers tonight at 3 AM UTC.', type: 'warning', isRead: false, createdAt: new Date().toISOString() }];

// Utilities
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Service Methods
export const mockApi = {
  login: async (email: string, password: string, code?: string): Promise<{ user?: User; access_token?: string; requires2fa?: boolean }> => {
    await delay(800);
    if (email === MOCK_USER.email && MOCK_USER.isTwoFactorEnabled) {
        if (!code) return { requires2fa: true };
        if (code !== '123456') throw new Error('Invalid 2FA Code');
    }
    if (email.includes('admin')) {
      return { user: { ...MOCK_USER, email, role: 'admin', plan: 'pro', name: 'Admin User' }, access_token: 'mock_admin_token' };
    }
    if (password.length >= 6) {
      MOCK_USER = { ...MOCK_USER, email, name: email.split('@')[0] };
      return { user: MOCK_USER, access_token: 'mock_token' };
    }
    throw new Error('Invalid credentials (mock)');
  },

  register: async (email: string, password: string): Promise<User> => {
    await delay(1500);
    const newUser = { id: `u-${Math.floor(Math.random() * 100000)}`, email, name: email.split('@')[0], fullName: email.split('@')[0], plan: 'free', role: 'user', isActive: true, createdAt: new Date().toISOString(), referralCode: `REF${Date.now()}`, referralCount: 0, credits: 0 } as User;
    MOCK_USER = newUser;
    MOCK_USERS_DB.push(newUser);
    return MOCK_USER;
  },

  getLocations: async (): Promise<ServerLocation[]> => { await delay(500); return LOCATIONS; },

  generateConfig: async (locationId: string, options?: { dns?: string, mtu?: number }): Promise<string> => {
    await delay(1500);
    const location = LOCATIONS.find(l => l.id === locationId);
    MOCK_DEVICES.unshift({ id: `dev-${Date.now()}`, name: `Device-${location?.countryCode}-${Math.floor(Math.random()*1000)}`, createdAt: new Date().toISOString(), publicKey: 'mock-new-key', locationId });
    MOCK_AUDIT_LOGS.unshift({ id: `log-${Date.now()}`, action: 'VPN_KEY_GENERATED', actorId: MOCK_USER.id, actorEmail: MOCK_USER.email, details: `Location: ${location?.city}`, createdAt: new Date().toISOString(), severity: 'info', ipAddress: '192.168.1.1' });
    return `[Interface]\nPrivateKey = aK9+...\nAddress = 10.100.0.5/32\nDNS = ${options?.dns || '1.1.1.1'}\nMTU = ${options?.mtu || 1420}\n[Peer]\nPublicKey = ServerKey\nAllowedIPs = 0.0.0.0/0\nEndpoint = vpn.${location?.countryCode}.nexus:51820`;
  },

  getUserDevices: async (): Promise<VpnConfig[]> => { await delay(600); return MOCK_DEVICES; },

  revokeDevice: async (id: string): Promise<void> => {
      await delay(800);
      MOCK_DEVICES = MOCK_DEVICES.filter(d => d.id !== id);
       MOCK_AUDIT_LOGS.unshift({ id: `log-${Date.now()}`, action: 'VPN_KEY_REVOKED', actorId: MOCK_USER.id, actorEmail: MOCK_USER.email, targetId: id, details: 'User revoked device', createdAt: new Date().toISOString(), severity: 'warning', ipAddress: '192.168.1.1' });
  },

  updateProfile: async (data: any): Promise<User> => {
    await delay(1000);
    MOCK_USER = { ...MOCK_USER, ...data };
    return { ...MOCK_USER };
  },

  // ... (Preserve existing billing methods) ...
  createCheckoutSession: async (plan: string): Promise<{ url: string }> => { await delay(1000); return { url: '#' }; },
  createPortalSession: async (): Promise<{ url: string }> => { await delay(800); return { url: '#' }; },
  cancelSubscription: async (): Promise<void> => { await delay(800); MOCK_USER.plan = 'free'; },
  getBillingHistory: async (): Promise<BillingInvoice[]> => { await delay(800); return [{ id: 'inv_1', date: '2023-11-01', amount: 500, status: 'paid', planName: 'Basic', pdfUrl: '#' }]; },

  getAdminStats: async (): Promise<any> => {
    await delay(600);
    // Simulate some movement in stats
    return {
      users: { total: MOCK_USERS_DB.length, active: MOCK_USERS_DB.filter(u => u.isActive).length },
      tunnels: { total: 4521 + Math.floor(Math.random() * 10) },
      servers: LOCATIONS.map(l => ({ ...l, status: 'Online', ipv4: l.ipv4 || '192.168.x.x', hasKey: true, metrics: { cpu: Math.floor(Math.random() * 80), ram: Math.floor(Math.random() * 60), network: Math.floor(Math.random() * 1000) } })),
    };
  },

  addServer: async (data: any): Promise<any> => { await delay(500); const s = { ...data, id: `srv-${Date.now()}`, load: 0, ping: 10 }; LOCATIONS.push(s); return s; },
  removeServer: async (id: string): Promise<void> => { await delay(500); LOCATIONS = LOCATIONS.filter(l => l.id !== id); },
  getAllUsers: async (): Promise<User[]> => { await delay(700); return MOCK_USERS_DB; },
  updateUser: async (id: string, data: any): Promise<void> => { await delay(500); const u = MOCK_USERS_DB.find(x => x.id === id); if(u) Object.assign(u, data); },
  deleteUser: async (id: string): Promise<void> => { await delay(500); MOCK_USERS_DB = MOCK_USERS_DB.filter(x => x.id !== id); },
  
  // Generating usage history for charts (Last 30 days)
  getUsageHistory: async (): Promise<any> => { 
      await delay(400); 
      const history = [];
      const today = new Date();
      for (let i = 29; i >= 0; i--) {
          const d = new Date(today);
          d.setDate(d.getDate() - i);
          history.push({
              recordDate: d.toISOString().split('T')[0],
              bytesDownloaded: Math.floor(Math.random() * 5000000000).toString(),
              bytesUploaded: Math.floor(Math.random() * 1000000000).toString(),
          });
      }
      return { history, total: { up: '450000000', down: '1200000000', combined: '1650000000' } }; 
  },
  
  getAuditLogs: async (): Promise<AuditLogEntry[]> => { await delay(400); return MOCK_AUDIT_LOGS; },
  
  getSystemSettings: async (): Promise<SystemSetting[]> => { await delay(300); return MOCK_SETTINGS; },
  updateSystemSetting: async (key: string, value: string): Promise<void> => { await delay(300); const s = MOCK_SETTINGS.find(x => x.key === key); if(s) s.value = value; },
  
  generate2fa: async (): Promise<{ secret: string; qrCode: string }> => { await delay(500); return { secret: 'SECRET', qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=otpauth://totp/NexusVPN:demo?secret=SECRET' }; },
  enable2fa: async (code: string): Promise<void> => { await delay(500); if(code!=='123456') throw new Error('Invalid'); MOCK_USER.isTwoFactorEnabled = true; },
  
  getTickets: async (): Promise<Ticket[]> => { await delay(400); return MOCK_TICKETS; },
  createTicket: async (subject: string, message: string, priority: string): Promise<Ticket> => { await delay(600); const t = { id: `t-${Date.now()}`, subject, status: 'open', priority, userId: MOCK_USER.id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as Ticket; MOCK_TICKETS.unshift(t); MOCK_MESSAGES.push({ id: `m-${Date.now()}`, ticketId: t.id, senderId: MOCK_USER.id, senderRole: 'user', message, createdAt: new Date().toISOString() }); return t; },
  getTicketMessages: async (id: string): Promise<TicketMessage[]> => { await delay(300); return MOCK_MESSAGES.filter(m => m.ticketId === id); },
  replyTicket: async (id: string, message: string): Promise<TicketMessage> => { await delay(400); const m: TicketMessage = { id: `m-${Date.now()}`, ticketId: id, senderId: MOCK_USER.id, senderRole: 'user', message, createdAt: new Date().toISOString() }; MOCK_MESSAGES.push(m); return m; },
  closeTicket: async (id: string): Promise<void> => { await delay(300); const t = MOCK_TICKETS.find(x => x.id === id); if(t) t.status = 'closed'; },

  // --- NEW FEATURES API ---
  getConnectionLogs: async (): Promise<ConnectionLog[]> => { await delay(600); return MOCK_CONN_LOGS; },
  getActiveSessions: async (): Promise<ActiveSession[]> => { await delay(400); return MOCK_SESSIONS; },
  revokeSession: async (id: string): Promise<void> => { await delay(500); MOCK_SESSIONS = MOCK_SESSIONS.filter(s => s.id !== id); },
  
  getCoupons: async (): Promise<Coupon[]> => { await delay(500); return MOCK_COUPONS; },
  createCoupon: async (coupon: any): Promise<Coupon> => { await delay(600); const c = { ...coupon, id: `cp-${Date.now()}`, usedCount: 0 }; MOCK_COUPONS.push(c); return c; },
  deleteCoupon: async (id: string): Promise<void> => { await delay(500); MOCK_COUPONS = MOCK_COUPONS.filter(c => c.id !== id); },
  
  getNotifications: async (): Promise<Notification[]> => { await delay(300); return MOCK_NOTIFICATIONS; },
  markNotificationRead: async (id: string): Promise<void> => { await delay(200); const n = MOCK_NOTIFICATIONS.find(x => x.id === id); if(n) n.isRead = true; },
  getReferralStats: async (): Promise<ReferralStats> => { await delay(400); return { totalInvited: MOCK_USER.referralCount || 0, totalEarned: MOCK_USER.credits || 0, pendingInvites: 1 }; },

  // --- MARKETING API ---
  getCampaigns: async (): Promise<Campaign[]> => { await delay(500); return MOCK_CAMPAIGNS; },

  // --- DEVELOPER API (NEW) ---
  getApiKeys: async (): Promise<ApiKey[]> => { await delay(400); return MOCK_API_KEYS; },
  createApiKey: async (name: string, scopes: any[]): Promise<ApiKey> => { await delay(600); const k: ApiKey = { id: `key-${Date.now()}`, name, prefix: `nx_${Date.now().toString().slice(-4)}...`, createdAt: new Date().toISOString(), scopes, status: 'active', rateLimit: 1000, usageCount: 0 }; MOCK_API_KEYS.push(k); return k; },
  revokeApiKey: async (id: string): Promise<void> => { await delay(400); MOCK_API_KEYS = MOCK_API_KEYS.filter(k => k.id !== id); },
  updateApiKey: async (id: string, data: any): Promise<void> => { await delay(300); const k = MOCK_API_KEYS.find(x => x.id === id); if(k) Object.assign(k, data); },
  
  getWebhooks: async (): Promise<WebhookEndpoint[]> => { await delay(350); return MOCK_WEBHOOKS; },
  createWebhook: async (url: string, events: string[]): Promise<WebhookEndpoint> => { await delay(500); const w: WebhookEndpoint = { id: `wh-${Date.now()}`, url, events, isActive: true, secret: `whsec_${Math.random().toString(36).substring(7)}`, createdAt: new Date().toISOString(), failureCount: 0 }; MOCK_WEBHOOKS.push(w); return w; },
  deleteWebhook: async (id: string): Promise<void> => { await delay(400); MOCK_WEBHOOKS = MOCK_WEBHOOKS.filter(w => w.id !== id); },
  testWebhook: async (id: string): Promise<void> => { await delay(1000); /* Simulate success */ },
  updateWebhook: async (id: string, data: any): Promise<void> => { await delay(300); const w = MOCK_WEBHOOKS.find(x => x.id === id); if(w) Object.assign(w, data); },

  getLoginHistory: async (): Promise<LoginHistory[]> => { await delay(400); return MOCK_LOGIN_HISTORY; }
};