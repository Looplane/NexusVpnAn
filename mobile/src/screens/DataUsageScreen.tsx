import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, TrendingUp, Download, Upload, Activity } from 'lucide-react-native';
import { apiClient } from '../services/apiClient';
import { UsageStats } from '../types';
import { TouchableOpacity } from 'react-native';

export default function DataUsageScreen({ navigation }: any) {
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadUsage();
  }, []);

  const loadUsage = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.getUsage();
      setUsage(data);
    } catch (e: any) {
      console.error('Failed to load usage:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadUsage();
    setRefreshing(false);
  };

  const formatBytes = (bytes: string | number) => {
    const num = typeof bytes === 'string' ? parseFloat(bytes) : bytes;
    if (num === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(num) / Math.log(k));
    return `${(num / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0ea5e9" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={20} color="#94a3b8" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Data Usage</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#0ea5e9" />
        }
      >
        {/* Today */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today</Text>
          <View style={styles.statCard}>
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <Download size={20} color="#0ea5e9" />
                <Text style={styles.statLabel}>Downloaded</Text>
                <Text style={styles.statValue}>
                  {usage?.today ? formatBytes(usage.today.bytesDownloaded) : '0 B'}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Upload size={20} color="#10b981" />
                <Text style={styles.statLabel}>Uploaded</Text>
                <Text style={styles.statValue}>
                  {usage?.today ? formatBytes(usage.today.bytesUploaded) : '0 B'}
                </Text>
              </View>
            </View>
            <View style={styles.totalRow}>
              <Activity size={16} color="#a855f7" />
              <Text style={styles.totalLabel}>Total: </Text>
              <Text style={styles.totalValue}>
                {usage?.today ? formatBytes(usage.today.totalBytes || 
                  (parseFloat(usage.today.bytesDownloaded) + parseFloat(usage.today.bytesUploaded)).toString()
                ) : '0 B'}
              </Text>
            </View>
          </View>
        </View>

        {/* This Week */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>This Week</Text>
          <View style={styles.statCard}>
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <Download size={20} color="#0ea5e9" />
                <Text style={styles.statLabel}>Downloaded</Text>
                <Text style={styles.statValue}>
                  {usage?.week ? formatBytes(usage.week.bytesDownloaded) : '0 B'}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Upload size={20} color="#10b981" />
                <Text style={styles.statLabel}>Uploaded</Text>
                <Text style={styles.statValue}>
                  {usage?.week ? formatBytes(usage.week.bytesUploaded) : '0 B'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* This Month */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>This Month</Text>
          <View style={styles.statCard}>
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <Download size={20} color="#0ea5e9" />
                <Text style={styles.statLabel}>Downloaded</Text>
                <Text style={styles.statValue}>
                  {usage?.month ? formatBytes(usage.month.bytesDownloaded) : '0 B'}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Upload size={20} color="#10b981" />
                <Text style={styles.statLabel}>Uploaded</Text>
                <Text style={styles.statValue}>
                  {usage?.month ? formatBytes(usage.month.bytesUploaded) : '0 B'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* All Time */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Time</Text>
          <View style={styles.statCard}>
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <TrendingUp size={20} color="#f59e0b" />
                <Text style={styles.statLabel}>Total Data</Text>
                <Text style={styles.statValue}>
                  {usage?.total ? formatBytes(usage.total.totalBytes || 
                    (parseFloat(usage.total.bytesDownloaded) + parseFloat(usage.total.bytesUploaded)).toString()
                  ) : '0 B'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94a3b8',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  statCard: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 8,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
  },
  totalLabel: {
    fontSize: 14,
    color: '#94a3b8',
    marginLeft: 8,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#a855f7',
    marginLeft: 4,
  },
});

