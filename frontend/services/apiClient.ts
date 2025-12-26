
import { User, ServerLocation, BillingInvoice, VpnConfig, AuditLogEntry, SystemSetting, Ticket, TicketMessage, ConnectionLog, ActiveSession, Coupon, Notification, ReferralStats, Referral, Campaign, ApiKey, WebhookEndpoint, LoginHistory } from '../types';
import { mockApi } from './mockService';

const getEnv = () => {
  try { return (import.meta as any).env || {}; } catch { return {}; }
};
const env = getEnv();
const API_URL = env.VITE_API_URL || 'http://localhost:3000/api';

const getHeaders = () => {
  const token = localStorage.getItem('nexus_vpn_token');
  return { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) };
};

async function fetchWithFallback<T>(endpoint: string, options: RequestInit, mockFn: () => Promise<T>): Promise<T> {
  try {
    const res = await fetch(`${API_URL}${endpoint}`, options);

    // Global Auth Handling
    if (res.status === 401) {
      window.dispatchEvent(new Event('auth:unauthorized'));
      if (env.PROD) throw new Error('Unauthorized');
      // If dev, we might still want to fall back to mock to keep UI working
    }

    // Handle 403 Forbidden (Admin access required)
    if (res.status === 403) {
      const errorText = await res.text();
      console.error(`[API] 403 Forbidden for ${endpoint}:`, errorText);
      window.dispatchEvent(new CustomEvent('auth:forbidden', { detail: { endpoint, message: errorText } }));
      throw new Error('Access denied. Admin privileges required.');
    }

    if (!res.ok) {
      if (env.PROD) throw new Error(`Request failed with status ${res.status}`);
      console.warn(`[API] Fallback for ${endpoint}`);
      return mockFn();
    }
    return res.json();
  } catch (err) {
    if (env.PROD) throw err;
    console.warn(`[API] Error for ${endpoint}. Using Mock.`);
    return mockFn();
  }
}

export const apiClient = {
  // ... Existing methods ...
  login: async (email: string, password: string, code?: string) => { const res = await fetchWithFallback('/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password, code }) }, () => mockApi.login(email, password, code)); if (res?.access_token) { localStorage.setItem('nexus_vpn_token', res.access_token); localStorage.setItem('nexus_vpn_user', JSON.stringify(res.user)); } return res; },
  register: async (email: string, password: string) => fetchWithFallback('/users/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password, fullName: email.split('@')[0] }) }, () => mockApi.register(email, password)),
  getProfile: async () => fetchWithFallback<User>('/users/me', { method: 'GET', headers: getHeaders() }, async () => { /* No mock fallback for auth check to force logout if fail, handled by 401 */ throw new Error('Auth Check Failed'); }),

  getLocations: async () => fetchWithFallback('/locations', { method: 'GET', headers: getHeaders() }, () => mockApi.getLocations()),
  generateConfig: async (locationId: string, options?: any) => fetchWithFallback('/vpn/config', { method: 'POST', headers: getHeaders(), body: JSON.stringify({ locationId, ...options }) }, () => mockApi.generateConfig(locationId, options)),
  getUserDevices: async () => fetchWithFallback('/vpn/devices', { method: 'GET', headers: getHeaders() }, () => mockApi.getUserDevices()),
  revokeDevice: async (id: string) => fetchWithFallback(`/vpn/devices/${id}`, { method: 'DELETE', headers: getHeaders() }, () => mockApi.revokeDevice(id)),
  updateProfile: async (data: any) => fetchWithFallback('/users/me', { method: 'PUT', headers: getHeaders(), body: JSON.stringify(data) }, () => mockApi.updateProfile(data)),
  createCheckoutSession: async (plan: string) => fetchWithFallback('/payments/checkout', { method: 'POST', headers: getHeaders(), body: JSON.stringify({ plan }) }, () => mockApi.createCheckoutSession(plan)),
  createPortalSession: async () => fetchWithFallback('/payments/portal', { method: 'POST', headers: getHeaders() }, () => mockApi.createPortalSession()),
  cancelSubscription: async () => fetchWithFallback('/payments/subscription', { method: 'DELETE', headers: getHeaders() }, () => mockApi.cancelSubscription()),
  getBillingHistory: async () => fetchWithFallback('/payments/history', { method: 'GET', headers: getHeaders() }, () => mockApi.getBillingHistory()),
  getAdminStats: async () => fetchWithFallback('/admin/stats', { method: 'GET', headers: getHeaders() }, () => mockApi.getAdminStats()),
  addServer: async (data: any) => fetchWithFallback('/admin/servers', { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }, () => mockApi.addServer(data)),
  removeServer: async (id: string) => fetchWithFallback(`/admin/servers/${id}`, { method: 'DELETE', headers: getHeaders() }, () => mockApi.removeServer(id)),
  
  // Auto-Configuration
  detectServerOS: async (ipv4: string, sshUser?: string, sshPassword?: string) => fetchWithFallback('/admin/server-config/detect-os', { method: 'POST', headers: getHeaders(), body: JSON.stringify({ ipv4, sshUser, sshPassword }) }, async () => ({ type: 'unknown' })),
  checkServerRequirements: async (ipv4: string, sshUser?: string, sshPassword?: string) => fetchWithFallback('/admin/server-config/check-requirements', { method: 'POST', headers: getHeaders(), body: JSON.stringify({ ipv4, sshUser, sshPassword }) }, async () => ({ ssh: false, wireguard: false, firewall: false, ipForwarding: false, requiredPorts: [], missingPackages: [], services: { wireguard: 'not-installed', ssh: 'not-installed' } })),
  getServerFingerprint: async (ipv4: string, sshUser?: string, sshPassword?: string) => fetchWithFallback('/admin/server-config/fingerprint', { method: 'POST', headers: getHeaders(), body: JSON.stringify({ ipv4, sshUser, sshPassword }) }, async () => ({})),
  fetchWireGuardConfig: async (ipv4: string, sshUser?: string, sshPassword?: string) => fetchWithFallback('/admin/server-config/fetch-wg-config', { method: 'POST', headers: getHeaders(), body: JSON.stringify({ ipv4, sshUser, sshPassword }) }, async () => ({ config: null, success: false })),
  parseWireGuardConfig: async (config: string) => fetchWithFallback('/admin/server-config/parse-wg-config', { method: 'POST', headers: getHeaders(), body: JSON.stringify({ config }) }, async () => ({ parsed: {}, success: false })),
  autoConfigureServer: async (data: { ipv4: string; sshUser?: string; sshPassword?: string; name: string; city: string; country: string; countryCode: string; wgPort?: number }) => fetchWithFallback('/admin/server-config/auto-configure', { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }, async () => ({ success: false, server: null, osInfo: { type: 'unknown' }, requirements: {}, steps: [] })),

  // Node Provisioning & Control
  getServerSetupScript: async (id: string) => fetchWithFallback(`/admin/servers/${id}/setup-script`, { method: 'GET', headers: getHeaders() }, async () => ({ script: '# Mock Script\napt install wireguard' })),
  executeRemoteCommand: async (serverId: string, command: string) => fetchWithFallback(`/admin/servers/${serverId}/command`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ command }) }, async () => ({ output: `[MOCK OUTPUT] Executed: ${command}\nResult: Success (Simulated)` })),
  
  // Server Metrics & Monitoring
  getServerMetrics: async (serverId: string) => fetchWithFallback(`/admin/servers/${serverId}/metrics`, { method: 'GET', headers: getHeaders() }, async () => ({ cpu: { usage: 28, cores: 8, frequency: '3.2GHz' }, ram: { used: 12, total: 16, usage: 12 }, load: { current: 51, avg1: 0.45, avg5: 0.32, avg15: 0.15 }, uptime: '14d 02h 12m', network: { inbound: 0, outbound: 0 } })),
  getServerLogs: async (serverId: string, lines: number = 50) => fetchWithFallback(`/admin/servers/${serverId}/logs?lines=${lines}`, { method: 'GET', headers: getHeaders() }, async () => []),
  
  // Service Control
  controlWireGuardService: async (serverId: string, action: 'start' | 'stop' | 'restart' | 'status') => fetchWithFallback(`/admin/servers/${serverId}/service/${action}`, { method: 'POST', headers: getHeaders() }, async () => ({ status: 'running', message: 'Service control simulated' })),
  
  // Firewall Management
  getFirewallRules: async (serverId: string) => fetchWithFallback(`/admin/servers/${serverId}/firewall`, { method: 'GET', headers: getHeaders() }, async () => []),
  addFirewallRule: async (serverId: string, port: string, protocol?: string, description?: string) => fetchWithFallback(`/admin/servers/${serverId}/firewall`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ port, protocol, description }) }, async () => ({ success: true, message: 'Rule added (simulated)' })),
  deleteFirewallRule: async (serverId: string, ruleId: string, port?: string, protocol?: string) => {
    const queryParams = port && protocol ? `?port=${port}&protocol=${protocol}` : '';
    return fetchWithFallback(`/admin/servers/${serverId}/firewall/${ruleId}${queryParams}`, { method: 'DELETE', headers: getHeaders() }, async () => ({ success: true, message: 'Rule deleted (simulated)' }));
  },
  
  // WireGuard Configuration
  getWireGuardConfig: async (serverId: string) => fetchWithFallback(`/admin/servers/${serverId}/config`, { method: 'GET', headers: getHeaders() }, async () => ({ wgPort: 51820, dns: '1.1.1.1, 8.8.8.8', mtu: '1420', allowedIps: '10.100.0.0/24', keepAlive: '25' })),
  updateWireGuardConfig: async (serverId: string, config: any) => fetchWithFallback(`/admin/servers/${serverId}/config`, { method: 'PATCH', headers: getHeaders(), body: JSON.stringify(config) }, async () => ({ success: true, message: 'Configuration updated' })),

  getAllUsers: async () => fetchWithFallback('/admin/users', { method: 'GET', headers: getHeaders() }, () => mockApi.getAllUsers()),
  updateUser: async (id: string, data: any) => fetchWithFallback(`/admin/users/${id}`, { method: 'PATCH', headers: getHeaders(), body: JSON.stringify(data) }, () => mockApi.updateUser(id, data)),
  deleteUser: async (id: string) => fetchWithFallback(`/admin/users/${id}`, { method: 'DELETE', headers: getHeaders() }, () => mockApi.deleteUser(id)),
  getUsageHistory: async () => fetchWithFallback('/usage/history', { method: 'GET', headers: getHeaders() }, () => mockApi.getUsageHistory()),
  getAuditLogs: async () => fetchWithFallback('/admin/audit', { method: 'GET', headers: getHeaders() }, () => mockApi.getAuditLogs()),
  getSystemSettings: async () => fetchWithFallback('/admin/settings', { method: 'GET', headers: getHeaders() }, () => mockApi.getSystemSettings()),
  updateSystemSetting: async (key: string, value: string) => fetchWithFallback(`/admin/settings/${key}`, { method: 'PATCH', headers: getHeaders(), body: JSON.stringify({ value }) }, () => mockApi.updateSystemSetting(key, value)),
  generate2fa: async () => fetchWithFallback('/auth/2fa/generate', { method: 'POST', headers: getHeaders() }, () => mockApi.generate2fa()),
  enable2fa: async (code: string) => fetchWithFallback('/auth/2fa/enable', { method: 'POST', headers: getHeaders(), body: JSON.stringify({ code }) }, () => mockApi.enable2fa(code)),
  getTickets: async () => fetchWithFallback('/support/tickets', { method: 'GET', headers: getHeaders() }, () => mockApi.getTickets()),
  createTicket: async (subject: string, message: string, priority: string) => fetchWithFallback('/support/tickets', { method: 'POST', headers: getHeaders(), body: JSON.stringify({ subject, message, priority }) }, () => mockApi.createTicket(subject, message, priority)),
  getTicketMessages: async (id: string) => fetchWithFallback(`/support/tickets/${id}/messages`, { method: 'GET', headers: getHeaders() }, () => mockApi.getTicketMessages(id)),
  replyTicket: async (id: string, message: string) => fetchWithFallback(`/support/tickets/${id}/reply`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ message }) }, () => mockApi.replyTicket(id, message)),
  closeTicket: async (id: string) => fetchWithFallback(`/support/tickets/${id}/close`, { method: 'PATCH', headers: getHeaders() }, () => mockApi.closeTicket(id)),

  // --- NEW FEATURES ---
  getConnectionLogs: async () => fetchWithFallback('/vpn/logs', { method: 'GET', headers: getHeaders() }, () => mockApi.getConnectionLogs()),
  getActiveSessions: async () => fetchWithFallback('/auth/sessions', { method: 'GET', headers: getHeaders() }, () => mockApi.getActiveSessions()),
  revokeSession: async (id: string) => fetchWithFallback(`/auth/sessions/${id}`, { method: 'DELETE', headers: getHeaders() }, () => mockApi.revokeSession(id)),
  getCoupons: async () => fetchWithFallback('/admin/coupons', { method: 'GET', headers: getHeaders() }, () => mockApi.getCoupons()),
  createCoupon: async (data: any) => fetchWithFallback('/admin/coupons', { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }, () => mockApi.createCoupon(data)),
  deleteCoupon: async (id: string) => fetchWithFallback(`/admin/coupons/${id}`, { method: 'DELETE', headers: getHeaders() }, () => mockApi.deleteCoupon(id)),
  getNotifications: async () => fetchWithFallback('/notifications', { method: 'GET', headers: getHeaders() }, () => mockApi.getNotifications()),
  markNotificationRead: async (id: string) => fetchWithFallback(`/notifications/${id}/read`, { method: 'PATCH', headers: getHeaders() }, () => mockApi.markNotificationRead(id)),

  getReferralStats: async () => fetchWithFallback('/users/referrals', { method: 'GET', headers: getHeaders() }, () => mockApi.getReferralStats()),
  getReferralList: async () => fetchWithFallback('/users/referrals/list', { method: 'GET', headers: getHeaders() }, async () => [
    { email: 'al***@example.com', createdAt: new Date().toISOString(), isActive: true, plan: 'free' },
    { email: 'bo***@gmail.com', createdAt: new Date(Date.now() - 86400000).toISOString(), isActive: true, plan: 'pro' },
  ]),

  getCampaigns: async () => fetchWithFallback('/admin/campaigns', { method: 'GET', headers: getHeaders() }, () => mockApi.getCampaigns()),

  // --- DEVELOPER & SECURITY API (NEW) ---
  getApiKeys: async () => fetchWithFallback('/api/keys', { method: 'GET', headers: getHeaders() }, () => mockApi.getApiKeys()),
  createApiKey: async (name: string, scopes: string[]) => fetchWithFallback('/api/keys', { method: 'POST', headers: getHeaders(), body: JSON.stringify({ name, scopes }) }, () => mockApi.createApiKey(name, scopes)),
  revokeApiKey: async (id: string) => fetchWithFallback(`/api/keys/${id}`, { method: 'DELETE', headers: getHeaders() }, () => mockApi.revokeApiKey(id)),

  getWebhooks: async () => fetchWithFallback('/webhooks', { method: 'GET', headers: getHeaders() }, () => mockApi.getWebhooks()),
  createWebhook: async (url: string, events: string[]) => fetchWithFallback('/webhooks', { method: 'POST', headers: getHeaders(), body: JSON.stringify({ url, events }) }, () => mockApi.createWebhook(url, events)),
  deleteWebhook: async (id: string) => fetchWithFallback(`/webhooks/${id}`, { method: 'DELETE', headers: getHeaders() }, () => mockApi.deleteWebhook(id)),
  testWebhook: async (id: string) => fetchWithFallback(`/webhooks/${id}/test`, { method: 'POST', headers: getHeaders() }, () => mockApi.testWebhook(id)),

  getLoginHistory: async () => fetchWithFallback('/auth/history', { method: 'GET', headers: getHeaders() }, () => mockApi.getLoginHistory())
};
