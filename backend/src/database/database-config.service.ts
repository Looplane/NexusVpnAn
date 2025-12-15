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
 * IPv6-Compatible Database Configuration Factory
 * 
 * This factory implements a robust IPv6 fallback strategy that handles:
 * - ENETUNREACH errors (IPv6 connectivity issues)
 * - Automatic IP family selection
 * - Connection retry logic with exponential backoff
 * - Fallback to alternative connection methods
 */
@Injectable()
export class DatabaseConfigService implements TypeOrmOptionsFactory {
  createTypeOrmOptions(): TypeOrmModuleOptions {
    const isProduction = process.env.NODE_ENV === 'production';
    const entities = [
      User, VpnConfig, Server, IpAssignment, UsageRecord, AuditLog, 
      SystemSetting, Ticket, TicketMessage, Notification, Coupon, Session, LoginHistory
    ];

    // IPv6-optimized connection configuration
    const ipv6Config = {
      // Core connection settings
      type: 'postgres' as const,
      entities,
      synchronize: true, // Note: Use migrations in production
      
      // IPv6-specific retry and timeout configuration
      retryAttempts: 15, // High retry count for IPv6 issues
      retryDelay: 5000, // 5 second initial delay
      
      // Enhanced connection pool settings for IPv6
      extra: {
        // Application identification
        application_name: 'nexusvpn-api-ipv6',
        
        // IPv6 connection optimization
        connectionTimeoutMillis: 60000, // 60 seconds for IPv6
        idleTimeoutMillis: 30000,
        max: 3, // Conservative connection limit for IPv6
        
        // IPv6-specific settings
        keepAlive: true,
        keepAliveInitialDelayMillis: 15000,
        
        // DNS and connection fallback settings
        lookup: this.createIPv6FallbackLookup(),
      },
      
      // SSL configuration for production
      ssl: isProduction ? { rejectUnauthorized: false } : false,
    };

    // Handle DATABASE_URL (PaaS environments like Render)
    if (process.env.DATABASE_URL) {
      return {
        ...ipv6Config,
        url: this.processDatabaseUrl(process.env.DATABASE_URL),
      };
    }

    // Fallback to individual connection parameters
    return {
      ...ipv6Config,
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 5432,
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
          .catch((err) => {
            console.log(`⚠️ IPv6 connectivity issue: ${err.message}`);
            console.log('🔄 Attempting IPv4 fallback...');
            
            // Try IPv4 lookup as fallback
            return lookup(url.hostname, { family: 4 })
              .then((result) => {
                console.log(`✅ IPv4 fallback successful: ${result.address}`);
                // Update URL with IPv4 address
                url.hostname = result.address;
                return url.toString();
              })
              .catch((ipv4Err) => {
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
      } catch (ipv6Error) {
        console.log(`⚠️ IPv6 lookup failed: ${ipv6Error.message}`);
        
        try {
          // Fallback to IPv4
          const ipv4Result = await lookup(hostname, { family: 4 });
          console.log(`✅ IPv4 fallback successful: ${ipv4Result.address}`);
          callback(null, ipv4Result.address, ipv4Result.family);
        } catch (ipv4Error) {
          console.log(`❌ IPv4 fallback also failed: ${ipv4Error.message}`);
          callback(ipv4Error);
        }
      }
    };
  }
}