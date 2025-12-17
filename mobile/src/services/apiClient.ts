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
      // @fix Fixed bug where requires2fa was hardcoded to false when accessToken was present
      // @fix Changed from strict equality (=== true) to truthy check to handle various truthy values
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

  /**
   * Verify 2FA code and complete authentication
   * 
   * @param email - User email address
   * @param password - User password
   * @param code - 6-digit 2FA code from authenticator app
   * @returns Success status and user data
   * @throws Error if verification fails or token is missing
   * 
   * @fix Changed from non-existent /auth/verify-2fa endpoint to /auth/login with code parameter
   * @fix Added validation to ensure token exists before storing
   * @fix Added edge case handling for requires2fa still being true after code submission
   */
  verify2FA: async (email: string, password: string, code: string) => {
    try {
      // Backend login endpoint accepts code parameter for 2FA verification
      // The same endpoint handles both initial login and 2FA verification
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, code })
      });

      const data = await handleResponse(res);
      
      // Check if 2FA is still required (shouldn't happen with valid code, but handle edge case)
      // This protects against backend inconsistencies or invalid codes
      if (data.requires2fa) {
        throw new Error('2FA verification still required. Please check your code.');
      }
      
      // Ensure we have a token before storing
      // Both accessToken and access_token formats are supported for compatibility
      if (data.accessToken || data.access_token) {
        const token = data.accessToken || data.access_token;
        await SecureStore.setItemAsync('nexus_token', token);
        await SecureStore.setItemAsync('nexus_user', JSON.stringify(data.user || {}));
        return { success: true, user: data.user };
      }
      
      // If no token, something went wrong with authentication
      throw new Error('Authentication failed: No access token received');
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