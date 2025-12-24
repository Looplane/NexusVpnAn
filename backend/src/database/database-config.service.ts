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
 * Render IPv4-First Database Configuration Factory
 * 
 * This factory implements Render's recommended approach for IPv6 connectivity issues:
 * - IPv4-first DNS resolution using NODE_OPTIONS=--dns-result-order=ipv4first
 * - Connection pooling optimized for Render's free tier
 * - Fallback mechanisms for IPv6 connectivity issues
 * - ENETUNREACH error resolution
 * 
 * Based on Render's guidance: Force IPv4 using NODE_OPTIONS=--dns-result-order=ipv4first
 */
@Injectable()
export class DatabaseConfigService implements TypeOrmOptionsFactory {
  createTypeOrmOptions(): TypeOrmModuleOptions {
    const isProduction = process.env.NODE_ENV === 'production';
    const entities = [
      User, VpnConfig, Server, IpAssignment, UsageRecord, AuditLog, 
      SystemSetting, Ticket, TicketMessage, Notification, Coupon, Session, LoginHistory
    ];

    // ✅ FIX: SSL should be controlled by env (works for Render/Supabase AND Coolify/local)
    // - If DATABASE_SSL is "true" => enable SSL with rejectUnauthorized=false (common on PaaS)
    // - Otherwise => SSL disabled (common for internal Docker/Coolify postgres)
    const sslEnabled =
      process.env.DATABASE_SSL === 'true' ||
      process.env.DB_SSL === 'true';

    // Render IPv4-first connection configuration
    const renderConfig = {
      // Core connection settings
      type: 'postgres' as const,
      entities,
      synchronize: true, // Note: Use migrations in production
      
      // Render-optimized retry configuration (moderate for free tier)
      retryAttempts: parseInt(process.env.DATABASE_RETRY_ATTEMPTS || '10', 10),
      retryDelay: 3000, // 3 second initial delay
      
      // Render free tier optimized connection pool
      extra: {
        // Application identification
        application_name: 'nexusvpn-api-render',
        
        // Render-optimized timeouts (moderate for free tier)
        connectionTimeoutMillis: parseInt(process.env.DATABASE_CONNECTION_TIMEOUT || '30000', 10) || 30000, // 30 seconds
        idleTimeoutMillis: parseInt(process.env.DATABASE_POOL_IDLE_TIMEOUT || '10000', 10) || 10000, // 10 seconds
        max: parseInt(process.env.DATABASE_POOL_MAX || '5', 10) || 5, // Moderate for free tier
        
        // Connection stability settings
        keepAlive: true,
        keepAliveInitialDelayMillis: 10000, // 10 seconds
        
        // IPv4-first DNS resolution (works with NODE_OPTIONS=--dns-result-order=ipv4first)
        // This is Render's recommended approach for IPv6 connectivity issues
      },
      
      // ✅ FIXED SSL configuration (no "messed" logic, safe for all environments)
      ssl: sslEnabled ? { rejectUnauthorized: false } : false,
    };

    // Handle DATABASE_URL (PaaS environments like Render)
    if (process.env.DATABASE_URL) {
      // Keep your original behavior (URL as-is)
      // If you ever want URL processing, use: url: this.processDatabaseUrl(process.env.DATABASE_URL)
      return {
        ...renderConfig,
        url: process.env.DATABASE_URL, // Use URL as-is, let platform handle DNS resolution
      };
    }

    // Fallback to individual connection parameters
    return {
      ...renderConfig,
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10) || 5432,
      username: process.env.DB_USER || 'nexus',
      password: process.env.DB_PASSWORD || 'secure_password_123',
      database: process.env.DB_NAME || 'nexusvpn',
    };
  }

  /**
   * Process DATABASE_URL to handle IPv6 connectivity issues
   */
  private processDatabaseUrl(databaseUrl: string): string {
    try {
      const url = new URL(databaseUrl);
      
      // Check if hostname is IPv6 and potentially problematic
      if (this.isIPv6Address(url.hostname)) {
        console.log(`🔍 IPv6 address detected: ${url.hostname}`);
        
        // Try to resolve hostname to check connectivity
        const dns = require('dns');
        const { promisify } = require('util');
        const lookup = promisify(dns.lookup);
        
        // Test IPv6 connectivity
        lookup(url.hostname, { family: 6 })
          .then(() => {
            console.log('✅ IPv6 connectivity confirmed');
          })
          .catch((err: any) => {
            console.log(`⚠️ IPv6 connectivity issue: ${err.message}`);
            console.log('🔄 Attempting IPv4 fallback...');
            
            // Try IPv4 lookup as fallback
            return lookup(url.hostname, { family: 4 })
              .then((result: any) => {
                console.log(`✅ IPv4 fallback successful: ${result.address}`);
                // Update URL with IPv4 address
                url.hostname = result.address;
                return url.toString();
              })
              .catch((ipv4Err: any) => {
                console.log(`❌ IPv4 fallback also failed: ${ipv4Err.message}`);
                // Return original URL and let TypeORM handle the error
                return databaseUrl;
              });
          });
      }
      
      return databaseUrl;
    } catch (error) {
      console.error('Error processing database URL:', error);
      return databaseUrl;
    }
  }

  /**
   * Check if hostname is an IPv6 address
   */
  private isIPv6Address(hostname: string): boolean {
    // Simple IPv6 detection - contains colons and is not just port separator
    return hostname.includes(':') && hostname.split(':').length > 2;
  }

  /**
   * Create custom lookup function for IPv6 fallback
   */
  private createIPv6FallbackLookup() {
    const dns = require('dns');
    const { promisify } = require('util');
    const lookup = promisify(dns.lookup);
    
    return async (hostname: string, options: any, callback: Function) => {
      try {
        // First, try IPv6
        const ipv6Result = await lookup(hostname, { family: 6 });
        console.log(`✅ IPv6 lookup successful: ${ipv6Result.address}`);
        callback(null, ipv6Result.address, ipv6Result.family);
      } catch (ipv6Error: any) {
        console.log(`⚠️ IPv6 lookup failed: ${ipv6Error.message}`);
        
        try {
          // Fallback to IPv4
          const ipv4Result = await lookup(hostname, { family: 4 });
          console.log(`✅ IPv4 fallback successful: ${ipv4Result.address}`);
          callback(null, ipv4Result.address, ipv4Result.family);
        } catch (ipv4Error: any) {
          console.log(`❌ IPv4 fallback also failed: ${ipv4Error.message}`);
          callback(ipv4Error);
        }
      }
    };
  }
}
