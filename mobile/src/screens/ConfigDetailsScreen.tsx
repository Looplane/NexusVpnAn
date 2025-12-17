import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Download, QrCode, Copy, Check } from 'lucide-react-native';
import { apiClient } from '../services/apiClient';
import { VpnConfig } from '../types';
import * as Clipboard from 'expo-clipboard';
import QRCode from 'react-native-qrcode-svg';

export default function ConfigDetailsScreen({ navigation, route }: any) {
  const { configId } = route.params;
  const [config, setConfig] = useState<VpnConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setIsLoading(true);
      const devices = await apiClient.getDevices();
      const found = devices.find((d: VpnConfig) => d.id === configId);
      if (found) {
        // Generate QR code if not present
        if (!found.qrCode && found.config) {
          found.qrCode = found.config;
        }
        setConfig(found);
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to load config');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (config?.config) {
      try {
        await Clipboard.setStringAsync(config.config);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (e) {
        console.error('Copy failed:', e);
      }
    }
  };

  const handleShare = async () => {
    if (config?.config) {
      try {
        await Share.share({
          message: config.config,
          title: `NexusVPN Config - ${config.name}`,
        });
      } catch (e) {
        console.error('Share failed:', e);
      }
    }
  };

  const handleDownload = () => {
    // In production, this would save to device storage
    Alert.alert('Download', 'Config file would be saved to your device');
  };

  if (isLoading || !config) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.loadingText}>Loading...</Text>
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
        <Text style={styles.headerTitle}>{config.name}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView>
        {/* QR Code */}
        {config.qrCode && (
          <View style={styles.qrSection}>
            <Text style={styles.sectionTitle}>QR Code</Text>
            <View style={styles.qrContainer}>
              <QRCode
                value={config.qrCode || config.config || ''}
                size={250}
                backgroundColor="#0f172a"
                color="#fff"
              />
            </View>
            <Text style={styles.qrHint}>Scan with WireGuard app to import</Text>
          </View>
        )}

        {/* Config File */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Configuration File</Text>
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={handleCopy}
              >
                {copied ? (
                  <Check size={18} color="#10b981" />
                ) : (
                  <Copy size={18} color="#0ea5e9" />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={handleShare}
              >
                <Download size={18} color="#0ea5e9" />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.configBox}>
            <Text style={styles.configText} selectable>
              {config.config || 'No config available'}
            </Text>
          </View>
        </View>

        {/* Device Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Device Information</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Name</Text>
              <Text style={styles.infoValue}>{config.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Assigned IP</Text>
              <Text style={styles.infoValue}>{config.assignedIp}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Public Key</Text>
              <Text style={styles.infoValue} numberOfLines={1}>
                {config.publicKey}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Created</Text>
              <Text style={styles.infoValue}>
                {new Date(config.createdAt).toLocaleString()}
              </Text>
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
  loadingText: {
    color: '#94a3b8',
    fontSize: 16,
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
  qrSection: {
    alignItems: 'center',
    padding: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94a3b8',
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  qrContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
  },
  qrHint: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 8,
  },
  configBox: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  configText: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#94a3b8',
    lineHeight: 18,
  },
  infoCard: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  infoValue: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
});

