import * as SecureStore from 'expo-secure-store';

// For Android Emulator, use 10.0.2.2. For iOS/Physical, use your LAN IP.
const API_URL = 'http://10.0.2.2:3000/api';

const getHeaders = async () => {
  const token = await SecureStore.getItemAsync('nexus_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const apiClient = {
  login: async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) throw new Error('Login failed');

      const data = await res.json();

      if (data.access_token) {
        await SecureStore.setItemAsync('nexus_token', data.access_token);
        await SecureStore.setItemAsync('nexus_user', JSON.stringify(data.user));
        return { success: true };
      }
      return { success: false, requires2fa: data.requires2fa };
    } catch (e) {
      console.error('Login Error:', e);
      throw e;
    }
  },

  getSession: async () => {
    const user = await SecureStore.getItemAsync('nexus_user');
    return user ? JSON.parse(user) : null;
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('nexus_token');
    await SecureStore.deleteItemAsync('nexus_user');
  }
};