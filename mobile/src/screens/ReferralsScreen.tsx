import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Share, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Users, Gift, Copy, Check, Share2 } from 'lucide-react-native';
import { apiClient } from '../services/apiClient';
import { ReferralStats } from '../types';
import * as Clipboard from 'expo-clipboard';

export default function ReferralsScreen({ navigation }: any) {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      // Note: Referral API endpoints need to be added to backend
      // For now, using mock data
      setStats({
        totalReferrals: 0,
        completedReferrals: 0,
        totalRewards: 0,
        referralCode: 'NEXUS2025',
        referrals: [],
      });
    } catch (e: any) {
      console.error('Failed to load referrals:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  const handleCopyCode = async () => {
    if (stats?.referralCode) {
      await Clipboard.setStringAsync(stats.referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (stats?.referralCode) {
      try {
        await Share.share({
          message: `Join NexusVPN using my referral code: ${stats.referralCode}\nGet secure VPN access today!`,
          title: 'NexusVPN Referral',
        });
      } catch (e) {
        console.error('Share failed:', e);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={20} color="#94a3b8" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Referrals</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#0ea5e9" />
        }
      >
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Users size={24} color="#0ea5e9" />
            <Text style={styles.statValue}>{stats?.totalReferrals || 0}</Text>
            <Text style={styles.statLabel}>Total Referrals</Text>
          </View>
          <View style={styles.statCard}>
            <Gift size={24} color="#10b981" />
            <Text style={styles.statValue}>{stats?.completedReferrals || 0}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>

        {/* Referral Code */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Referral Code</Text>
          <View style={styles.codeCard}>
            <Text style={styles.codeText}>{stats?.referralCode || 'NEXUS2025'}</Text>
            <View style={styles.codeActions}>
              <TouchableOpacity
                style={styles.codeButton}
                onPress={handleCopyCode}
              >
                {copied ? (
                  <Check size={18} color="#10b981" />
                ) : (
                  <Copy size={18} color="#0ea5e9" />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.codeButton}
                onPress={handleShare}
              >
                <Share2 size={18} color="#0ea5e9" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Rewards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rewards</Text>
          <View style={styles.rewardCard}>
            <Gift size={32} color="#f59e0b" />
            <Text style={styles.rewardValue}>
              ${stats?.totalRewards || 0}
            </Text>
            <Text style={styles.rewardLabel}>Total Rewards Earned</Text>
          </View>
        </View>

        {/* How It Works */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How It Works</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoItem}>
              <View style={styles.infoNumber}>
                <Text style={styles.infoNumberText}>1</Text>
              </View>
              <Text style={styles.infoText}>Share your referral code with friends</Text>
            </View>
            <View style={styles.infoItem}>
              <View style={styles.infoNumber}>
                <Text style={styles.infoNumberText}>2</Text>
              </View>
              <Text style={styles.infoText}>They sign up using your code</Text>
            </View>
            <View style={styles.infoItem}>
              <View style={styles.infoNumber}>
                <Text style={styles.infoNumberText}>3</Text>
              </View>
              <Text style={styles.infoText}>You both earn rewards!</Text>
            </View>
          </View>
        </View>

        {/* Referral List */}
        {stats && stats.referrals.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Referrals</Text>
            {stats.referrals.map((ref) => (
              <View key={ref.id} style={styles.referralItem}>
                <View style={styles.referralInfo}>
                  <Text style={styles.referralEmail}>{ref.referredEmail}</Text>
                  <Text style={styles.referralDate}>
                    {new Date(ref.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: ref.status === 'completed' ? '#064e3b' : '#78350f' }
                ]}>
                  <Text style={styles.statusText}>{ref.status}</Text>
                </View>
              </View>
            ))}
          </View>
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
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94a3b8',
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  codeCard: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  codeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0ea5e9',
    letterSpacing: 2,
  },
  codeActions: {
    flexDirection: 'row',
    gap: 8,
  },
  codeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 8,
  },
  rewardCard: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  rewardValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#f59e0b',
    marginTop: 12,
    marginBottom: 4,
  },
  rewardLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  infoCard: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0ea5e9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoNumberText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#fff',
  },
  referralItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  referralInfo: {
    flex: 1,
  },
  referralEmail: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  referralDate: {
    fontSize: 12,
    color: '#64748b',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'uppercase',
  },
});

