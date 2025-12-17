import { useState, useEffect } from 'react';
import { vpnService, VPNConnection } from '../services/vpnService';

export const useVPN = () => {
  const [connection, setConnection] = useState<VPNConnection>(vpnService.getConnection());
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setConnection(vpnService.getConnection());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const connect = async (serverId: string, serverName: string) => {
    setIsConnecting(true);
    try {
      const success = await vpnService.connect(serverId, serverName);
      if (success) {
        setConnection(vpnService.getConnection());
      }
      return success;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = async () => {
    setIsConnecting(true);
    try {
      const success = await vpnService.disconnect();
      if (success) {
        setConnection(vpnService.getConnection());
      }
      return success;
    } finally {
      setIsConnecting(false);
    }
  };

  return {
    connection,
    isConnecting,
    connect,
    disconnect,
    isConnected: connection.isConnected,
  };
};

