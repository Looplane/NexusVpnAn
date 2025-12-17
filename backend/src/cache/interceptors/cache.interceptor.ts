import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { CacheService } from '../cache.service';
import { CACHE_TTL_KEY } from '../decorators/cache.decorator';
import { MetricsService } from '../../common/services/metrics.service';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(
    private cacheService: CacheService,
    private reflector: Reflector,
    private metrics: MetricsService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const handler = context.getHandler();
    const controller = context.getClass();

    // Get cache metadata
    const cacheMetadata = this.reflector.get<{ ttl: number; prefix?: string }>(
      CACHE_TTL_KEY,
      handler,
    );

    // If no cache metadata, proceed normally
    if (!cacheMetadata) {
      return next.handle();
    }

    // Generate cache key
    const cacheKey = this.generateCacheKey(
      request,
      controller.name,
      handler.name,
      cacheMetadata.prefix,
    );

    // Try to get from cache
    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      this.metrics.recordCacheHit();
      return of(cached);
    }

    // If not cached, execute and cache the result
    this.metrics.recordCacheMiss();
    return next.handle().pipe(
      tap(async (data) => {
        await this.cacheService.set(cacheKey, data, cacheMetadata.ttl);
      }),
    );
  }

  private generateCacheKey(
    request: any,
    controllerName: string,
    handlerName: string,
    prefix?: string,
  ): string {
    const parts = [
      prefix || 'api',
      controllerName.toLowerCase(),
      handlerName.toLowerCase(),
    ];

    // Include user ID if authenticated
    if (request.user?.userId) {
      parts.push(`user:${request.user.userId}`);
    }

    // Include query parameters for GET requests
    if (request.method === 'GET' && Object.keys(request.query).length > 0) {
      const queryString = JSON.stringify(request.query);
      parts.push(`query:${Buffer.from(queryString).toString('base64')}`);
    }

    // Include path parameters
    if (request.params && Object.keys(request.params).length > 0) {
      const paramsString = JSON.stringify(request.params);
      parts.push(`params:${Buffer.from(paramsString).toString('base64')}`);
    }

    return parts.join(':');
  }
}

