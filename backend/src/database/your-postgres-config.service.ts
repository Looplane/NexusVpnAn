import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { VpnConfig } from '../vpn/entities/vpn-config.entity';
import { Server } from '../locations/entities/server.entity';
import { IpAssignment } from '../vpn/entities/ip-assignment.entity';
import { UsageRecord } from '../usage/entities/usage.entity';
import { AuditLog } from '../audit/entities/audit-log.entity';
import { SystemSetting } from '../audit/entities/system-setting.entity';
import { Ticket } from '../support/entities/ticket.entity';
import { TicketMessage } from '../support/entities/ticket-message.entity';
import { Notification } from '../notifications/entities/notification.entity';
import { Coupon } from '../marketing/entities/coupon.entity';
import { Session } from '../auth/entities/session.entity';
import { LoginHistory } from '../auth/entities/login-history.entity';

/**
 * Your Personal PostgreSQL Server Configuration
 * 
 * This configuration connects to your PostgreSQL server at 91.99.23.239:5432
 * Optimized for external server connections with proper security settings
 */
@Injectable()
export class YourPostgresConfigService implements TypeOrmOptionsFactory {
  createTypeOrmOptions(): TypeOrmModuleOptions {
    const entities = [
      User, VpnConfig, Server, IpAssignment, UsageRecord, AuditLog, 
      SystemSetting, Ticket, TicketMessage, Notification, Coupon, Session, LoginHistory
    ];

    // Your PostgreSQL server configuration
    const config = {
      type: 'postgres' as const,
      host: process.env.YOUR_DB_HOST || '91.99.23.239',
      port: parseInt(process.env.YOUR_DB_PORT, 10) || 5432,
      username: process.env.YOUR_DB_USER || 'postgres',
      password: process.env.YOUR_DB_PASSWORD || '',
      database: process.env.YOUR_DB_NAME || 'nexusvpn',
      
      entities,
      synchronize: process.env.NODE_ENV !== 'production', // Disable sync in production
      
      // Connection settings optimized for external server
      retryAttempts: 5,
      retryDelay: 2000, // 2 seconds between retries
      
      // Connection pool settings for external server
      extra: {
        application_name: 'nexusvpn-your-server',
        
        // Connection timeouts for external server
        connectionTimeoutMillis: 15000, // 15 seconds
        idleTimeoutMillis: 30000, // 30 seconds
        max: 10, // Maximum 10 connections
        
        // Keep alive settings
        keepAlive: true,
        keepAliveInitialDelayMillis: 5000, // 5 seconds
        
        // SSL settings for external connections (disabled for your server)
        ssl: false, // Your server doesn't support SSL
      },
      
      // SSL configuration (disabled for your server)
      ssl: false, // Your server doesn't support SSL
    };

    console.log('🗄️ Connecting to your PostgreSQL server:', {
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.username,
      ssl: config.ssl !== false
    });

    return config;
  }

  /**
   * Test connection to your PostgreSQL server
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const { Pool } = require('pg');
      const pool = new Pool({
        host: process.env.YOUR_DB_HOST || '91.99.23.239',
        port: parseInt(process.env.YOUR_DB_PORT, 10) || 5432,
        user: process.env.YOUR_DB_USER || 'postgres',
        password: process.env.YOUR_DB_PASSWORD || '',
        database: process.env.YOUR_DB_NAME || 'nexusvpn',
        ssl: false, // Your server doesn't support SSL
      });

      const client = await pool.connect();
      const result = await client.query('SELECT version()');
      await client.release();
      await pool.end();

      return {
        success: true,
        message: `Connected to PostgreSQL ${result.rows[0].version}`
      };
    } catch (error) {
      return {
        success: false,
        message: `Connection failed: ${error.message}`
      };
    }
  }
}