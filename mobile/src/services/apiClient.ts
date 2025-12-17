import * as SecureStore from 'expo-secure-store';

// For Android Emulator, use 10.0.2.2. For iOS/Physical, use your LAN IP.
// For production, use your Render backend URL
const API_URL = __DEV__ 
  ? 'http://10.0.2.2:3000/api' 
  : 'https://nexusvpn-api.onrender.com/api';

const getHeaders = async () => {
  const token = await SecureStore.getItemAsync('nexus_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

const handleResponse = async (res: Response) => {
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }
  return res.json();
};

export const apiClient = {
  // Authentication
  login: async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await handleResponse(res);

      // Check if 2FA is required first, regardless of token presence
      // Backend might return an intermediate token that still requires 2FA verification
      // Use truthy check to handle boolean true, truthy strings, numbers, etc.
      if (data.requires2fa) {
        return { success: false, requires2fa: Boolean(data.requires2fa) };
      }

      if (data.accessToken || data.access_token) {
        const token = data.accessToken || data.access_token;
        await SecureStore.setItemAsync('nexus_token', token);
        await SecureStore.setItemAsync('nexus_user', JSON.stringify(data.user || {}));
        return { success: true, requires2fa: false };
      }
      // Preserve the original requires2fa value if present (normalized to boolean), default to false
      return { success: false, requires2fa: Boolean(data.requires2fa) };
    } catch (e: any) {
      console.error('Login Error:', e);
      throw new Error(e.message || 'Login failed');
    }
  },

  register: async (email: string, password: string, fullName: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName })
      });

      const data = await handleResponse(res);
      return { success: true, user: data.user };
    } catch (e: any) {
      console.error('Register Error:', e);
      throw new Error(e.message || 'Registration failed');
    }
  },

  verify2FA: async (token: string, code: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/verify-2fa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, code })
      });

      const data = await handleResponse(res);
      if (data.accessToken) {
        await SecureStore.setItemAsync('nexus_token', data.accessToken);
        await SecureStore.setItemAsync('nexus_user', JSON.stringify(data.user || {}));
      }
      return data;
    } catch (e: any) {
      console.error('2FA Error:', e);
      throw new Error(e.message || '2FA verification failed');
    }
  },

  getSession: async () => {
    try {
      const user = await SecureStore.getItemAsync('nexus_user');
      if (!user) return null;

      // Verify token is still valid
      const headers = await getHeaders();
      const res = await fetch(`${API_URL}/users/me`, { headers });
      
      if (res.ok) {
        const currentUser = await res.json();
        await SecureStore.setItemAsync('nexus_user', JSON.stringify(currentUser));
        return currentUser;
      }
      
      // Token expired, return cached user
      return JSON.parse(user);
    } catch (e) {
      const user = await SecureStore.getItemAsync('nexus_user');
      return user ? JSON.parse(user) : null;
    }
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('nexus_token');
    await SecureStore.deleteItemAsync('nexus_user');
  },

  // Locations & Servers
  getLocations: async () => {
    const headers = await getHeaders();
    const res = await fetch(`${API_URL}/locations`, { headers });
    return handleResponse(res);
  },

  // VPN Management
  generateConfig: async (locationId: string, name: string) => {
    const headers = await getHeaders();
    const res = await fetch(`${API_URL}/vpn/config`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ locationId, name })
    });
    return handleResponse(res);
  },

  getDevices: async () => {
    const headers = await getHeaders();
    const res = await fetch(`${API_URL}/vpn/devices`, { headers });
    return handleResponse(res);
  },

  revokeDevice: async (deviceId: string) => {
    const headers = await getHeaders();
    const res = await fetch(`${API_URL}/vpn/devices/${deviceId}`, {
      method: 'DELETE',
      headers
    });
    return handleResponse(res);
  },

  // Usage & Statistics
  getUsage: async () => {
    const headers = await getHeaders();
    const res = await fetch(`${API_URL}/usage`, { headers });
    return handleResponse(res);
  },

  // User Profile
  updateProfile: async (data: { fullName?: string; email?: string }) => {
    const headers = await getHeaders();
    const res = await fetch(`${API_URL}/users/profile`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    const headers = await getHeaders();
    const res = await fetch(`${API_URL}/users/change-password`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ currentPassword, newPassword })
    });
    return handleResponse(res);
  },

  // Support (when backend endpoints are ready)
  getTickets: async () => {
    const headers = await getHeaders();
    const res = await fetch(`${API_URL}/support/tickets`, { headers });
    return handleResponse(res);
  },

  createTicket: async (subject: string, message: string) => {
    const headers = await getHeaders();
    const res = await fetch(`${API_URL}/support/tickets`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ subject, message })
    });
    return handleResponse(res);
  },

  sendTicketMessage: async (ticketId: string, message: string) => {
    const headers = await getHeaders();
    const res = await fetch(`${API_URL}/support/tickets/${ticketId}/messages`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ message })
    });
    return handleResponse(res);
  },

  // Referrals (when backend endpoints are ready)
  getReferrals: async () => {
    const headers = await getHeaders();
    const res = await fetch(`${API_URL}/referrals`, { headers });
    return handleResponse(res);
  },

  // Connection Logs (when backend endpoints are ready)
  getConnectionLogs: async () => {
    const headers = await getHeaders();
    const res = await fetch(`${API_URL}/vpn/logs`, { headers });
    return handleResponse(res);
  }
};