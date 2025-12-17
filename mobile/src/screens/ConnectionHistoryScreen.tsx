import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Clock, Activity, Globe } from 'lucide-react-native';
import { apiClient } from '../services/apiClient';
import { ConnectionLog } from '../types';

export default function ConnectionHistoryScreen({ navigation }: any) {
  const [logs, setLogs] = useState<ConnectionLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setIsLoading(true);
      // Note: This endpoint may need to be added to backend
      const data = await apiClient.getUsage(); // Using usage as fallback
      // In production, use: const data = await apiClient.getConnectionLogs();
      setLogs([]); // Placeholder until backend endpoint is ready
    } catch (e: any) {
      console.error('Failed to load logs:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadLogs();
    setRefreshing(false);
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={20} color="#94a3b8" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Connection History</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#0ea5e9" />
        }
      >
        {logs.length === 0 ? (
          <View style={styles.empty}>
            <Clock size={48} color="#64748b" />
            <Text style={styles.emptyText}>No connection history</Text>
            <Text style={styles.emptySubtext}>
              Your connection logs will appear here
            </Text>
          </View>
        ) : (
          logs.map((log) => (
            <View key={log.id} style={styles.logCard}>
              <View style={styles.logHeader}>
                <View style={[
                  styles.statusIndicator,
                  log.action === 'connect' ? styles.connected : styles.disconnected
                ]}>
                  {log.action === 'connect' ? (
                    <Activity size={12} color="#10b981" />
                  ) : (
                    <Globe size={12} color="#ef4444" />
                  )}
                </View>
                <View style={styles.logInfo}>
                  <Text style={styles.logAction}>
                    {log.action === 'connect' ? 'Connected' : 'Disconnected'}
                  </Text>
                  <Text style={styles.logServer}>{log.serverName}</Text>
                </View>
                <Text style={styles.logTime}>
                  {formatDate(log.timestamp)}
                </Text>
              </View>
              {log.duration && (
                <View style={styles.logDetails}>
                  <Text style={styles.logDetailText}>
                    Duration: {formatDuration(log.duration)}
                  </Text>
                  {log.bytesTransferred && (
                    <Text style={styles.logDetailText}>
                      Data: {formatBytes(log.bytesTransferred)}
                    </Text>
                  )}
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const formatBytes = (bytes: string | number) => {
  const num = typeof bytes === 'string' ? parseFloat(bytes) : bytes;
  if (num === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(num) / Math.log(k));
  return `${(num / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
};

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
  logCard: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  connected: {
    backgroundColor: '#064e3b',
  },
  disconnected: {
    backgroundColor: '#7f1d1d',
  },
  logInfo: {
    flex: 1,
  },
  logAction: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  logServer: {
    fontSize: 12,
    color: '#64748b',
  },
  logTime: {
    fontSize: 11,
    color: '#64748b',
  },
  logDetails: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
  },
  logDetailText: {
    fontSize: 12,
    color: '#94a3b8',
  },
});

