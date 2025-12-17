import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input } from '../components/UI';
import { apiClient } from '../services/apiClient';
import { Shield } from 'lucide-react-native';

export default function TwoFactorScreen({ navigation, route }: any) {
  const { email, password } = route.params || {};
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async () => {
    if (code.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit code');
      return;
    }

    if (!email || !password) {
      Alert.alert('Error', 'Missing credentials. Please try logging in again.');
      navigation.goBack();
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.verify2FA(email, password, code);
      navigation.replace('Dashboard');
    } catch (e: any) {
      Alert.alert('Verification Failed', e.message || 'Invalid code. Please try again.');
      setCode('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Shield size={32} color="#fff" />
          </View>
          <Text style={styles.title}>Two-Factor Authentication</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit code from your authenticator app
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Verification Code"
            value={code}
            onChangeText={(text) => {
              // Only allow numbers, max 6 digits
              const numeric = text.replace(/[^0-9]/g, '').slice(0, 6);
              setCode(numeric);
            }}
            placeholder="000000"
            keyboardType="number-pad"
            maxLength={6}
            autoFocus
          />
          <Button
            title="Verify"
            onPress={handleVerify}
            isLoading={isLoading}
            disabled={code.length !== 6}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
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
    backgroundColor: '#0ea5e9',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
  },
  form: {
    gap: 8,
  },
});

