import { SetMetadata } from '@nestjs/common';

export const CACHE_TTL_KEY = 'cache_ttl';
export const CACHE_KEY_PREFIX = 'cache_key_prefix';

/**
 * Cache decorator to cache method results
 * @param ttlSeconds Time to live in seconds (default: 300 = 5 minutes)
 * @param keyPrefix Optional key prefix for cache key generation
 */
export const Cache = (ttlSeconds: number = 300, keyPrefix?: string) => {
  return SetMetadata(CACHE_TTL_KEY, { ttl: ttlSeconds, prefix: keyPrefix });
};

