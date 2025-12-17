import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiClient } from '../services/apiClient';
import { Globe, Check, Loader } from 'lucide-react-native';

interface Server {
  id: string;
  name: string;
  city: string;
  country: string;
  countryCode: string;
  load: number;
  ping: number;
  premium: boolean;
  isActive: boolean;
}

export default function ServerSelectionScreen({ navigation, route }: any) {
  const { onSelect } = route.params || {};
  const [servers, setServers] = useState<Server[]>([]);
  const [selectedServer, setSelectedServer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadServers();
  }, []);

  const loadServers = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.getLocations();
      setServers(data.filter((s: Server) => s.isActive));
    } catch (e: any) {
      setError(e.message || 'Failed to load servers');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (server: Server) => {
    setSelectedServer(server.id);
    if (onSelect) {
      onSelect(server);
      navigation.goBack();
    }
  };

  const getLoadColor = (load: number) => {
    if (load < 30) return '#10b981'; // green
    if (load < 70) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0ea5e9" />
          <Text style={styles.loadingText}>Loading servers...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={loadServers} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Select Server</Text>
        <Text style={styles.subtitle}>{servers.length} servers available</Text>
      </View>

      <ScrollView style={styles.list}>
        {servers.map((server) => (
          <TouchableOpacity
            key={server.id}
            style={[
              styles.serverItem,
              selectedServer === server.id && styles.serverItemSelected
            ]}
            onPress={() => handleSelect(server)}
          >
            <View style={styles.serverInfo}>
              <View style={styles.flagContainer}>
                <Globe size={24} color="#0ea5e9" />
              </View>
              <View style={styles.serverDetails}>
                <Text style={styles.serverName}>{server.name}</Text>
                <Text style={styles.serverLocation}>
                  {server.city}, {server.country}
                </Text>
                <View style={styles.serverStats}>
                  <View style={styles.stat}>
                    <Loader size={12} color={getLoadColor(server.load)} />
                    <Text style={[styles.statText, { color: getLoadColor(server.load) }]}>
                      {server.load}% load
                    </Text>
                  </View>
                  <Text style={styles.statText}>•</Text>
                  <Text style={styles.statText}>{server.ping}ms ping</Text>
                  {server.premium && (
                    <>
                      <Text style={styles.statText}>•</Text>
                      <Text style={styles.premiumBadge}>Premium</Text>
                    </>
                  )}
                </View>
              </View>
            </View>
            {selectedServer === server.id && (
              <Check size={20} color="#0ea5e9" />
            )}
          </TouchableOpacity>
        ))}
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
    marginTop: 16,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#0ea5e9',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
  },
  list: {
    flex: 1,
  },
  serverItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0f172a',
    padding: 16,
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  serverItemSelected: {
    borderColor: '#0ea5e9',
    backgroundColor: '#0f172a',
  },
  serverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  flagContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  serverDetails: {
    flex: 1,
  },
  serverName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  serverLocation: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 8,
  },
  serverStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#64748b',
  },
  premiumBadge: {
    fontSize: 12,
    color: '#f59e0b',
    fontWeight: '600',
  },
});

