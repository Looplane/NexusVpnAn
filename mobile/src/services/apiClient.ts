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
        // In a real app, fetch from API. Mocking for MVP UI dev.
        // const res = await fetch(`${API_URL}/auth/login`, ...);
        
        // Mock Response
        await new Promise(r => setTimeout(r, 1000));
        if (email.includes('error')) throw new Error('Invalid credentials');
        
        const mockToken = 'mock_mobile_jwt';
        await SecureStore.setItemAsync('nexus_token', mockToken);
        await SecureStore.setItemAsync('nexus_user', JSON.stringify({ email, id: 'u-123', plan: 'pro' }));
        return { success: true };
    } catch (e) {
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