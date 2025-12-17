/**
 * VPN Connection Service
 * Mock implementation for WireGuard connection management
 * In production, this would use native modules for actual VPN connections
 */

export interface VPNConnection {
  isConnected: boolean;
  serverId: string | null;
  serverName: string | null;
  connectedAt: Date | null;
  duration: number; // seconds
}

class VPNService {
  private connection: VPNConnection = {
    isConnected: false,
    serverId: null,
    serverName: null,
    connectedAt: null,
    duration: 0,
  };

  private intervalId: NodeJS.Timeout | null = null;

  async connect(serverId: string, serverName: string): Promise<boolean> {
    try {
      // In production, this would:
      // 1. Get VPN config from backend
      // 2. Use native WireGuard module to establish connection
      // 3. Monitor connection status

      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate connection time

      this.connection = {
        isConnected: true,
        serverId,
        serverName,
        connectedAt: new Date(),
        duration: 0,
      };

      // Start duration timer
      this.startTimer();

      return true;
    } catch (error) {
      console.error('VPN connection failed:', error);
      return false;
    }
  }

  async disconnect(): Promise<boolean> {
    try {
      // In production, this would:
      // 1. Use native WireGuard module to disconnect
      // 2. Clean up connection state

      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate disconnection time

      this.stopTimer();
      this.connection = {
        isConnected: false,
        serverId: null,
        serverName: null,
        connectedAt: null,
        duration: 0,
      };

      return true;
    } catch (error) {
      console.error('VPN disconnection failed:', error);
      return false;
    }
  }

  getConnection(): VPNConnection {
    return { ...this.connection };
  }

  isConnected(): boolean {
    return this.connection.isConnected;
  }

  private startTimer() {
    this.stopTimer();
    this.intervalId = setInterval(() => {
      if (this.connection.connectedAt) {
        const now = new Date();
        this.connection.duration = Math.floor(
          (now.getTime() - this.connection.connectedAt.getTime()) / 1000
        );
      }
    }, 1000);
  }

  private stopTimer() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
}

export const vpnService = new VPNService();

