import { Injectable, Logger } from '@nestjs/common';
import { Client } from 'ssh2';
import * as fs from 'fs';

interface SshConnectionConfig {
  host: string;
  username: string;
  port?: number;
  timeout?: number;
}

@Injectable()
export class SshService {
  private readonly logger = new Logger(SshService.name);
  private privateKey: string;
  private publicKey: string;
  private isSimulationMode: boolean = false;
  private connectionPool: Map<string, Client> = new Map();

  constructor() {
    this.loadKeys();
  }

  private loadKeys() {
    // In production, we mount the key into the container at this path
    // Try multiple possible paths
    const possiblePaths = [
      process.env.SSH_PRIVATE_KEY_PATH,
      process.env.SSH_KEY_PATH,
      '/opt/nexusvpn/.ssh/id_rsa',
      '/etc/nexusvpn/id_rsa',
    ].filter(Boolean);

    let keyPath = possiblePaths[0] || '/opt/nexusvpn/.ssh/id_rsa';
    
    // Find first existing key path
    for (const path of possiblePaths) {
      if (fs.existsSync(path)) {
        keyPath = path;
        break;
      }
    }

    const pubKeyPath = keyPath + '.pub';

    try {
      // 1. Load Private Key
      if (fs.existsSync(keyPath)) {
        this.privateKey = fs.readFileSync(keyPath, 'utf8');
        this.logger.log(`SSH private key loaded from ${keyPath}`);
      } else if (process.env.VPN_SSH_KEY) {
        // Fallback to env var content (useful for cloud/dev)
        // Handle newlines which might be escaped in env vars
        this.privateKey = process.env.VPN_SSH_KEY.replace(/\\n/g, '\n');
        this.logger.log('SSH private key loaded from environment variable');
      } else {
        this.logger.warn(`No SSH key found. Entering SIMULATION MODE. Operations will be mocked.`);
        this.isSimulationMode = true;
      }

      // 2. Load Public Key (For provisioning remote nodes)
      if (fs.existsSync(pubKeyPath)) {
        this.publicKey = fs.readFileSync(pubKeyPath, 'utf8').trim();
      } else if (process.env.VPN_SSH_PUBLIC_KEY) {
        this.publicKey = process.env.VPN_SSH_PUBLIC_KEY.trim();
      } else {
        // Dev Mock Key
        this.publicKey = 'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC...mock-key... nexus-backend-dev';
      }

    } catch (e) {
      this.logger.warn(`Failed to load SSH keys: ${e.message}. Defaulting to SIMULATION MODE.`);
      this.isSimulationMode = true;
    }
  }

  getPublicKey(): string {
    return this.publicKey;
  }

  /**
   * Execute a command on a remote server with automatic retry and exponential backoff.
   */
  async executeCommand(
    command: string,
    host: string = '127.0.0.1',
    username: string = 'root',
    maxRetries: number = 3
  ): Promise<string> {

    // Simulation / Mock Mode
    if (this.isSimulationMode || process.env.MOCK_SSH === 'true') {
      return this.simulateCommand(command, host);
    }

    if (!this.privateKey) {
      throw new Error('SSH Private Key is missing. Cannot connect to remote nodes.');
    }

    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await this.executeWithTimeout(command, { host, username }, 15000);
        return result;
      } catch (error) {
        lastError = error;
        this.logger.warn(`SSH command failed (attempt ${attempt}/${maxRetries}) on ${host}: ${error.message}`);

        if (attempt < maxRetries) {
          // Exponential backoff: 1s, 2s, 4s
          const delay = Math.pow(2, attempt - 1) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw new Error(`SSH command failed after ${maxRetries} attempts: ${lastError.message}`);
  }

  /**
   * Execute a command with a timeout to prevent hanging connections.
   */
  private executeWithTimeout(
    command: string,
    config: SshConnectionConfig,
    timeoutMs: number
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const conn = new Client();
      let isResolved = false;

      const timeout = setTimeout(() => {
        if (!isResolved) {
          isResolved = true;
          conn.end();
          reject(new Error(`SSH command timed out after ${timeoutMs}ms`));
        }
      }, timeoutMs);

      conn.on('ready', () => {
        conn.exec(command, (err, stream) => {
          if (err) {
            clearTimeout(timeout);
            conn.end();
            if (!isResolved) {
              isResolved = true;
              reject(err);
            }
            return;
          }

          let dataBuffer = '';
          let errorBuffer = '';

          stream.on('close', (code, signal) => {
            clearTimeout(timeout);
            conn.end();

            if (isResolved) return;
            isResolved = true;

            if (code !== 0) {
              this.logger.error(`[SSH ${config.host}] Command failed with code ${code}: ${command}`);
              if (errorBuffer) {
                this.logger.error(`[SSH ${config.host}] stderr: ${errorBuffer}`);
              }
              reject(new Error(`Command failed on ${config.host} with exit code ${code}`));
            } else {
              this.logger.debug(`[SSH ${config.host}] Command succeeded: ${command.substring(0, 50)}...`);
              resolve(dataBuffer.trim());
            }
          }).on('data', (data) => {
            dataBuffer += data.toString();
          }).stderr.on('data', (data) => {
            errorBuffer += data.toString();
          });
        });
      }).on('error', (err) => {
        clearTimeout(timeout);
        if (!isResolved) {
          isResolved = true;
          this.logger.error(`[SSH Connection Error ${config.host}] ${err.message}`);
          reject(err);
        }
      }).connect({
        host: config.host,
        port: config.port || 22,
        username: config.username,
        privateKey: this.privateKey,
        readyTimeout: config.timeout || 10000,
      });
    });
  }

  /**
   * Simulate SSH commands for development/testing without a real server.
   */
  private async simulateCommand(command: string, host: string): Promise<string> {
    this.logger.debug(`[SIMULATION SSH -> ${host}] ${command}`);

    // Mimic realistic delays
    await new Promise(resolve => setTimeout(resolve, 100));

    if (command.includes('wg show wg0 dump')) {
      return 'mock-peer-key\t(none)\t10.100.0.2:58123\t10.100.0.2/32\t1683400000\t8920\t3290\tpersistent-keepalive';
    } else if (command.includes('cat /etc/wireguard/publickey')) {
      return 'SimulatedServerPublicKeyBase64=';
    } else if (command.includes('wg show wg0 transfer')) {
      return `mock-peer-key\t${Math.floor(Math.random() * 100000)}\t${Math.floor(Math.random() * 500000)}`;
    } else if (command.includes('wg set')) {
      return 'Peer added successfully (simulated)';
    } else {
      return 'mock-success-output';
    }
  }

  /**
   * Clean up any open connections on service shutdown.
   */
  onModuleDestroy() {
    this.connectionPool.forEach((conn, key) => {
      this.logger.log(`Closing SSH connection to ${key}`);
      conn.end();
    });
    this.connectionPool.clear();
  }
}