import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Smartphone, Laptop, Tablet, Monitor, Trash2, Download, QrCode } from 'lucide-react-native';
import { apiClient } from '../services/apiClient';
import { VpnConfig } from '../types';

export default function DevicesScreen({ navigation }: any) {
  const [devices, setDevices] = useState<VpnConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.getDevices();
      setDevices(data);
    } catch (e: any) {
      console.error('Failed to load devices:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDevices();
    setRefreshing(false);
  };

  const handleRevoke = (device: VpnConfig) => {
    Alert.alert(
      'Revoke Device',
      `Are you sure you want to revoke "${device.name}"? This will disconnect the device.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Revoke',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.revokeDevice(device.id);
              await loadDevices();
            } catch (e: any) {
              Alert.alert('Error', e.message || 'Failed to revoke device');
            }
          },
        },
      ]
    );
  };

  const handleViewConfig = (device: VpnConfig) => {
    navigation.navigate('ConfigDetails', { configId: device.id });
  };

  const getDeviceIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('phone') || lower.includes('mobile')) return Smartphone;
    if (lower.includes('tablet') || lower.includes('ipad')) return Tablet;
    if (lower.includes('laptop') || lower.includes('mac')) return Laptop;
    return Monitor;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={20} color="#94a3b8" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Devices</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#0ea5e9" />
        }
      >
        {devices.length === 0 ? (
          <View style={styles.empty}>
            <Monitor size={48} color="#64748b" />
            <Text style={styles.emptyText}>No devices configured</Text>
            <Text style={styles.emptySubtext}>Generate a VPN config to add a device</Text>
          </View>
        ) : (
          devices.map((device) => {
            const Icon = getDeviceIcon(device.name);
            return (
              <View key={device.id} style={styles.deviceCard}>
                <View style={styles.deviceHeader}>
                  <View style={styles.deviceIcon}>
                    <Icon size={24} color="#0ea5e9" />
                  </View>
                  <View style={styles.deviceInfo}>
                    <Text style={styles.deviceName}>{device.name}</Text>
                    <Text style={styles.deviceDetails}>
                      {device.assignedIp} • Created {new Date(device.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
                <View style={styles.deviceActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleViewConfig(device)}
                  >
                    <Download size={16} color="#0ea5e9" />
                    <Text style={styles.actionText}>Config</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleViewConfig(device)}
                  >
                    <QrCode size={16} color="#0ea5e9" />
                    <Text style={styles.actionText}>QR</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.dangerButton]}
                    onPress={() => handleRevoke(device)}
                  >
                    <Trash2 size={16} color="#ef4444" />
                    <Text style={[styles.actionText, styles.dangerText]}>Revoke</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  placeholder: {
    width: 40,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  deviceCard: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  deviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  deviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  deviceDetails: {
    fontSize: 12,
    color: '#64748b',
  },
  deviceActions: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    paddingTop: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1e293b',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  dangerButton: {
    backgroundColor: '#7f1d1d',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0ea5e9',
  },
  dangerText: {
    color: '#ef4444',
  },
});

