import { Injectable, Logger } from '@nestjs/common';
import { Client } from 'ssh2';
import * as fs from 'fs';

@Injectable()
export class SshService {
  private readonly logger = new Logger(SshService.name);
  private privateKey: string;
  private publicKey: string;
  private isSimulationMode: boolean = false;

  constructor() {
    this.loadKeys();
  }

  private loadKeys() {
    // In production, we mount the key into the container at this path
    const keyPath = process.env.SSH_KEY_PATH || '/etc/nexusvpn/id_rsa';
    const pubKeyPath = keyPath + '.pub';

    try {
      // 1. Load Private Key
      if (fs.existsSync(keyPath)) {
        this.privateKey = fs.readFileSync(keyPath, 'utf8');
      } else if (process.env.VPN_SSH_KEY) {
         // Fallback to env var content (useful for cloud/dev)
         // Handle newlines which might be escaped in env vars
         this.privateKey = process.env.VPN_SSH_KEY.replace(/\\n/g, '\n');
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

  async executeCommand(command: string, host: string = '127.0.0.1', username: string = 'root'): Promise<string> {
    return new Promise((resolve, reject) => {
      
      // Simulation / Mock Mode
      if (this.isSimulationMode || process.env.MOCK_SSH === 'true') {
          // this.logger.debug(`[SIMULATION SSH -> ${host}] ${command}`);
          
          // Mimic realistic delays
          setTimeout(() => {
              if (command.includes('wg show wg0 dump')) {
                  // Return a fake peer dump
                  resolve('mock-peer-key\t(none)\t10.100.0.2:58123\t10.100.0.2/32\t1683400000\t8920\t3290\tpersistent-keepalive');
              } else if (command.includes('cat /etc/wireguard/publickey')) {
                  resolve('SimulatedServerPublicKeyBase64=');
              } else if (command.includes('wg show wg0 transfer')) {
                  // Simulate data transfer
                  resolve(`mock-peer-key\t${Math.floor(Math.random() * 100000)}\t${Math.floor(Math.random() * 500000)}`);
              } else {
                  resolve('mock-success-output');
              }
          }, 100);
          return;
      }

      if (!this.privateKey) {
        return reject(new Error('SSH Private Key is missing. Cannot connect to remote nodes.'));
      }

      const conn = new Client();
      
      conn.on('ready', () => {
        conn.exec(command, (err, stream) => {
          if (err) {
            conn.end();
            return reject(err);
          }
          let dataBuffer = '';
          stream.on('close', (code, signal) => {
            conn.end();
            if (code !== 0) {
              this.logger.error(`[SSH ${host}] Cmd: ${command} | Exit Code: ${code}`);
              reject(new Error(`Command failed on ${host} with code ${code}`));
            } else {
              resolve(dataBuffer.trim());
            }
          }).on('data', (data) => {
            dataBuffer += data;
          }).stderr.on('data', (data) => {
            // Optional: Log stderr
          });
        });
      }).on('error', (err) => {
        this.logger.error(`[SSH Connection Error ${host}] ${err.message}`);
        reject(err);
      }).connect({
        host,
        port: 22,
        username,
        privateKey: this.privateKey,
        readyTimeout: 10000, // 10s timeout
      });
    });
  }
}