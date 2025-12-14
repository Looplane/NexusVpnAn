import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Power, Globe, Activity, Settings, LogOut } from 'lucide-react-native';
import { apiClient } from '../services/apiClient';

export default function DashboardScreen({ navigation }: any) {
  const [isConnected, setIsConnected] = useState(false);
  const [location, setLocation] = useState('US East');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    apiClient.getSession().then(setUser);
  }, []);

  const handleLogout = async () => {
    await apiClient.logout();
    navigation.replace('Login');
  };

  const toggleConnection = () => {
    // In real app, this invokes Native Module for WireGuard
    setIsConnected(!isConnected);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.email?.split('@')[0] || 'User'}</Text>
          <Text style={styles.statusText}>{isConnected ? 'Protected' : 'Unprotected'}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.iconBtn}>
          <LogOut color="#94a3b8" size={20} />
        </TouchableOpacity>
      </View>

      {/* Main Connection Circle */}
      <View style={styles.centerStage}>
        <TouchableOpacity 
          onPress={toggleConnection}
          activeOpacity={0.8}
          style={[
            styles.connectBtn, 
            isConnected ? styles.btnConnected : styles.btnDisconnected
          ]}
        >
          <Power size={64} color="#fff" />
          <Text style={styles.connectLabel}>{isConnected ? 'DISCONNECT' : 'QUICK CONNECT'}</Text>
        </TouchableOpacity>
        
        {isConnected && (
          <View style={styles.timerContainer}>
            <Activity size={14} color="#10b981" />
            <Text style={styles.timerText}>00:12:45</Text>
          </View>
        )}
      </View>

      {/* Stats / Info */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Globe size={24} color="#0ea5e9" style={{marginBottom: 8}} />
          <Text style={styles.statLabel}>Location</Text>
          <Text style={styles.statValue}>{location}</Text>
        </View>
        <View style={styles.statCard}>
          <Activity size={24} color="#a855f7" style={{marginBottom: 8}} />
          <Text style={styles.statLabel}>Protocol</Text>
          <Text style={styles.statValue}>WireGuard</Text>
        </View>
      </View>

      {/* Server List Placeholder */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Locations</Text>
        {['US East (Virginia)', 'EU Central (Frankfurt)', 'Asia (Tokyo)'].map((loc, i) => (
          <TouchableOpacity key={i} style={styles.listItem} onPress={() => setLocation(loc)}>
            <View style={styles.flag} />
            <Text style={styles.listText}>{loc}</Text>
            {location === loc && <View style={styles.dot} />}
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 40,
  },
  greeting: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  iconBtn: {
    padding: 8,
    backgroundColor: '#1e293b',
    borderRadius: 12,
  },
  centerStage: {
    alignItems: 'center',
    marginBottom: 40,
  },
  connectBtn: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    elevation: 10,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  btnDisconnected: {
    backgroundColor: '#1e293b', // slate-800
    borderColor: '#334155', // slate-700
    shadowColor: '#000',
  },
  btnConnected: {
    backgroundColor: '#0ea5e9', // brand-500
    borderColor: '#38bdf8', // brand-400
    shadowColor: '#0ea5e9',
  },
  connectLabel: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 12,
    letterSpacing: 1,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    backgroundColor: '#064e3b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  timerText: {
    color: '#34d399',
    marginLeft: 6,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  statLabel: {
    color: '#64748b',
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    flex: 1,
  },
  sectionTitle: {
    color: '#94a3b8',
    fontSize: 12,
    textTransform: 'uppercase',
    fontWeight: 'bold',
    marginBottom: 12,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  flag: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#334155',
    marginRight: 12,
  },
  listText: {
    color: '#fff',
    fontSize: 14,
    flex: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0ea5e9',
  }
});