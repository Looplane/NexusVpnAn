import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Power, Globe, Activity, Settings, LogOut, Server, BarChart3, Smartphone, Clock, MessageCircle, Users } from 'lucide-react-native';
import { apiClient } from '../services/apiClient';
import { useVPN } from '../hooks/useVPN';
import { useAuth, useToast } from '../contexts';
import { vpnService } from '../services/vpnService';

export default function DashboardScreen({ navigation }: any) {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();
  const { connection, isConnecting, connect, disconnect } = useVPN();
  const [refreshing, setRefreshing] = useState(false);
  const [servers, setServers] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const locations = await apiClient.getLocations().catch(() => []);
      setServers(locations);
      await refreshUser();
    } catch (e) {
      console.error('Failed to load data:', e);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            if (connection.isConnected) {
              await disconnect();
            }
            await apiClient.logout();
            navigation.replace('Login');
          },
        },
      ]
    );
  };

  const toggleConnection = async () => {
    if (connection.isConnected) {
      const success = await disconnect();
      if (success) {
        showToast('Disconnected', 'info');
      } else {
        showToast('Failed to disconnect', 'error');
      }
    } else {
      // Show server selection
      navigation.navigate('ServerSelection', {
        onSelect: async (server: any) => {
          const success = await connect(server.id, server.name);
          if (success) {
            showToast('Connected to ' + server.name, 'success');
          } else {
            showToast('Failed to connect', 'error');
          }
        }
      });
    }
  };

  const handleSelectServer = () => {
    navigation.navigate('ServerSelection', {
      onSelect: async (server: any) => {
        if (connection.isConnected) {
          await disconnect();
        }
        const success = await connect(server.id, server.name);
        if (success) {
          showToast('Connected to ' + server.name, 'success');
        } else {
          showToast('Failed to connect', 'error');
        }
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#0ea5e9" />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Hello, {user?.fullName || user?.email?.split('@')[0] || 'User'}
            </Text>
            <Text style={styles.statusText}>
              {connection.isConnected ? 'Protected' : 'Unprotected'}
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.iconBtn}>
              <Settings color="#94a3b8" size={20} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout} style={styles.iconBtn}>
              <LogOut color="#94a3b8" size={20} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Connection Circle */}
        <View style={styles.centerStage}>
          <TouchableOpacity 
            onPress={toggleConnection}
            activeOpacity={0.8}
            disabled={isConnecting}
            style={[
              styles.connectBtn, 
              connection.isConnected ? styles.btnConnected : styles.btnDisconnected,
              isConnecting && styles.btnLoading
            ]}
          >
            <Power size={64} color="#fff" />
            <Text style={styles.connectLabel}>
              {isConnecting ? 'CONNECTING...' : connection.isConnected ? 'DISCONNECT' : 'QUICK CONNECT'}
            </Text>
          </TouchableOpacity>
          
          {connection.isConnected && (
            <View style={styles.timerContainer}>
              <Activity size={14} color="#10b981" />
              <Text style={styles.timerText}>
                {vpnService.formatDuration(connection.duration)}
              </Text>
            </View>
          )}
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.quickAction}
          onPress={() => navigation.navigate('DataUsage')}
        >
          <BarChart3 size={20} color="#0ea5e9" />
          <Text style={styles.quickActionText}>Usage</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickAction}
          onPress={() => navigation.navigate('Devices')}
        >
          <Smartphone size={20} color="#0ea5e9" />
          <Text style={styles.quickActionText}>Devices</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickAction}
          onPress={() => navigation.navigate('ConnectionHistory')}
        >
          <Clock size={20} color="#0ea5e9" />
          <Text style={styles.quickActionText}>History</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickAction}
          onPress={() => navigation.navigate('Support')}
        >
          <MessageCircle size={20} color="#0ea5e9" />
          <Text style={styles.quickActionText}>Support</Text>
        </TouchableOpacity>
      </View>

      {/* Stats / Info */}
      <View style={styles.statsContainer}>
        <TouchableOpacity 
          style={styles.statCard}
          onPress={handleSelectServer}
          activeOpacity={0.7}
        >
          <Globe size={24} color="#0ea5e9" style={{marginBottom: 8}} />
          <Text style={styles.statLabel}>Location</Text>
          <Text style={styles.statValue} numberOfLines={1}>
            {connection.serverName || 'Not selected'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.statCard}
          onPress={() => navigation.navigate('Referrals')}
          activeOpacity={0.7}
        >
          <Users size={24} color="#a855f7" style={{marginBottom: 8}} />
          <Text style={styles.statLabel}>Referrals</Text>
          <Text style={styles.statValue}>Earn Rewards</Text>
        </TouchableOpacity>
      </View>

        {/* Server List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Available Servers</Text>
            <TouchableOpacity onPress={handleSelectServer}>
              <Server size={16} color="#0ea5e9" />
            </TouchableOpacity>
          </View>
          {servers.length > 0 ? (
            servers.slice(0, 3).map((server: any) => (
              <TouchableOpacity 
                key={server.id} 
                style={styles.listItem} 
                onPress={() => {
                  if (!connection.isConnected) {
                    handleSelectServer();
                  }
                }}
              >
                <View style={styles.flag}>
                  <Globe size={16} color="#64748b" />
                </View>
                <View style={styles.listItemContent}>
                  <Text style={styles.listText}>{server.name}</Text>
                  <Text style={styles.listSubtext}>{server.city}, {server.country}</Text>
                </View>
                {connection.serverId === server.id && connection.isConnected && (
                  <View style={styles.dot} />
                )}
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.emptyText}>No servers available</Text>
          )}
        </View>
      </ScrollView>
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
  headerActions: {
    flexDirection: 'row',
    gap: 8,
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
  btnLoading: {
    opacity: 0.7,
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
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1e293b',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listItemContent: {
    flex: 1,
  },
  listText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  listSubtext: {
    color: '#64748b',
    fontSize: 12,
  },
  emptyText: {
    color: '#64748b',
    fontSize: 14,
    textAlign: 'center',
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  quickAction: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  quickActionText: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0ea5e9',
  }
});