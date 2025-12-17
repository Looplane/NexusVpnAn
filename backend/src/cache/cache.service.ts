import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Cache Service Interface
 * Supports both Redis and in-memory caching
 */
@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private cache: Map<string, { value: any; expiresAt: number }> = new Map();
  private redisClient: any = null;
  private useRedis: boolean = false;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const redisUrl = this.configService.get<string>('REDIS_URL');
    const redisHost = this.configService.get<string>('REDIS_HOST');
    const redisPort = this.configService.get<number>('REDIS_PORT');

    // Try to connect to Redis if configured
    if (redisUrl || (redisHost && redisPort)) {
      try {
        // Dynamic import to avoid requiring redis in dev
        // @ts-expect-error - redis is an optional dependency
        const redis = await import('redis');
        this.redisClient = redis.createClient({
          url: redisUrl || `redis://${redisHost}:${redisPort}`,
          socket: {
            reconnectStrategy: (retries) => {
              if (retries > 10) {
                this.logger.warn('Redis connection failed, falling back to in-memory cache');
                return new Error('Redis connection failed');
              }
              return Math.min(retries * 100, 3000);
            },
          },
        });

        this.redisClient.on('error', (err: Error) => {
          this.logger.warn(`Redis error: ${err.message}, falling back to in-memory cache`);
          this.useRedis = false;
        });

        this.redisClient.on('connect', () => {
          this.logger.log('Redis connected successfully');
          this.useRedis = true;
        });

        await this.redisClient.connect();
      } catch (error) {
        this.logger.warn('Redis not available, using in-memory cache');
        this.useRedis = false;
      }
    } else {
      this.logger.log('Redis not configured, using in-memory cache');
      this.useRedis = false;
    }
  }

  async onModuleDestroy() {
    if (this.redisClient) {
      await this.redisClient.quit();
    }
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      if (this.useRedis && this.redisClient) {
        const value = await this.redisClient.get(key);
        return value ? JSON.parse(value) : null;
      } else {
        // In-memory cache
        const cached = this.cache.get(key);
        if (!cached) return null;

        // Check expiration
        if (cached.expiresAt && cached.expiresAt < Date.now()) {
          this.cache.delete(key);
          return null;
        }

        return cached.value;
      }
    } catch (error) {
      this.logger.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set value in cache with optional TTL (time to live in seconds)
   */
  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    try {
      if (this.useRedis && this.redisClient) {
        if (ttlSeconds) {
          await this.redisClient.setEx(key, ttlSeconds, JSON.stringify(value));
        } else {
          await this.redisClient.set(key, JSON.stringify(value));
        }
      } else {
        // In-memory cache
        const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined;
        this.cache.set(key, { value, expiresAt });

        // Clean up expired entries periodically
        if (this.cache.size > 1000) {
          this.cleanupExpired();
        }
      }
    } catch (error) {
      this.logger.error(`Cache set error for key ${key}:`, error);
    }
  }

  /**
   * Delete value from cache
   */
  async delete(key: string): Promise<void> {
    try {
      if (this.useRedis && this.redisClient) {
        await this.redisClient.del(key);
      } else {
        this.cache.delete(key);
      }
    } catch (error) {
      this.logger.error(`Cache delete error for key ${key}:`, error);
    }
  }

  /**
   * Delete multiple keys matching a pattern
   */
  async deletePattern(pattern: string): Promise<void> {
    try {
      if (this.useRedis && this.redisClient) {
        const keys = await this.redisClient.keys(pattern);
        if (keys.length > 0) {
          await this.redisClient.del(keys);
        }
      } else {
        // In-memory pattern matching
        const regex = new RegExp(pattern.replace('*', '.*'));
        for (const key of this.cache.keys()) {
          if (regex.test(key)) {
            this.cache.delete(key);
          }
        }
      }
    } catch (error) {
      this.logger.error(`Cache deletePattern error for pattern ${pattern}:`, error);
    }
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    try {
      if (this.useRedis && this.redisClient) {
        await this.redisClient.flushDb();
      } else {
        this.cache.clear();
      }
    } catch (error) {
      this.logger.error('Cache clear error:', error);
    }
  }

  /**
   * Clean up expired entries from in-memory cache
   */
  private cleanupExpired(): void {
    const now = Date.now();
    for (const [key, cached] of this.cache.entries()) {
      if (cached.expiresAt && cached.expiresAt < now) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Check if Redis is being used
   */
  isUsingRedis(): boolean {
    return this.useRedis;
  }
}

