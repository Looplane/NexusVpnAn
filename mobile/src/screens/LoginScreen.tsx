import React, { useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input } from '../components/UI';
import { apiClient } from '../services/apiClient';
import { Shield } from 'lucide-react-native';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setIsLoading(true);
    try {
      const result = await apiClient.login(email, password);
      if (result.requires2fa) {
        // For 2FA, we'd need a temporary token from the backend
        // For now, navigate to 2FA screen with email
        navigation.navigate('TwoFactor', { email });
      } else {
        navigation.replace('Dashboard');
      }
    } catch (e: any) {
      Alert.alert('Login Failed', e.message || 'Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Shield size={32} color="#fff" />
          </View>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to manage your secure tunnel.</Text>
        </View>

        <View style={styles.form}>
          <Input 
            label="Email" 
            value={email} 
            onChangeText={setEmail} 
            placeholder="you@example.com" 
          />
          <Input 
            label="Password" 
            value={password} 
            onChangeText={setPassword} 
            placeholder="••••••••" 
            secureTextEntry 
          />
          <Button title="Sign In" onPress={handleLogin} isLoading={isLoading} />
          
          <Button 
            title="Create Account" 
            onPress={() => navigation.navigate('Register')} 
            variant="outline" 
          />
        </View>
        
        <Text style={styles.footer}>NexusVPN Mobile v1.0</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617', // Slate 950
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  iconContainer: {
    width: 64,
    height: 64,
    backgroundColor: '#0ea5e9', // brand-500
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#0ea5e9',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8', // slate-400
    textAlign: 'center',
  },
  form: {
    gap: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    color: '#475569',
    fontSize: 12,
  },
});