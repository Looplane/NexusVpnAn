import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface Metrics {
  requests: {
    total: number;
    byMethod: Record<string, number>;
    byStatus: Record<number, number>;
  };
  performance: {
    averageResponseTime: number;
    slowRequests: number;
    fastRequests: number;
  };
  errors: {
    total: number;
    byType: Record<string, number>;
  };
  cache: {
    hits: number;
    misses: number;
  };
}

@Injectable()
export class MetricsService implements OnModuleInit {
  private metrics: Metrics = {
    requests: {
      total: 0,
      byMethod: {},
      byStatus: {},
    },
    performance: {
      averageResponseTime: 0,
      slowRequests: 0,
      fastRequests: 0,
    },
    errors: {
      total: 0,
      byType: {},
    },
    cache: {
      hits: 0,
      misses: 0,
    },
  };

  private responseTimes: number[] = [];
  private readonly maxResponseTimes = 1000; // Keep last 1000 response times for average

  onModuleInit() {
    // Reset metrics every hour (optional)
    if (process.env.RESET_METRICS_HOURLY === 'true') {
      setInterval(() => {
        this.resetMetrics();
      }, 60 * 60 * 1000);
    }
  }

  recordRequest(method: string, statusCode: number, duration: number) {
    this.metrics.requests.total++;
    this.metrics.requests.byMethod[method] = (this.metrics.requests.byMethod[method] || 0) + 1;
    this.metrics.requests.byStatus[statusCode] = (this.metrics.requests.byStatus[statusCode] || 0) + 1;

    // Track response times
    this.responseTimes.push(duration);
    if (this.responseTimes.length > this.maxResponseTimes) {
      this.responseTimes.shift();
    }

    // Update average response time
    const sum = this.responseTimes.reduce((a, b) => a + b, 0);
    this.metrics.performance.averageResponseTime = Math.round(sum / this.responseTimes.length);

    // Track slow/fast requests
    if (duration > 1000) {
      this.metrics.performance.slowRequests++;
    } else if (duration < 100) {
      this.metrics.performance.fastRequests++;
    }
  }

  recordError(errorType: string) {
    this.metrics.errors.total++;
    this.metrics.errors.byType[errorType] = (this.metrics.errors.byType[errorType] || 0) + 1;
  }

  recordCacheHit() {
    this.metrics.cache.hits++;
  }

  recordCacheMiss() {
    this.metrics.cache.misses++;
  }

  getMetrics(): Metrics {
    return { ...this.metrics };
  }

  getCacheHitRate(): number {
    const total = this.metrics.cache.hits + this.metrics.cache.misses;
    if (total === 0) return 0;
    return Math.round((this.metrics.cache.hits / total) * 100);
  }

  resetMetrics() {
    this.metrics = {
      requests: {
        total: 0,
        byMethod: {},
        byStatus: {},
      },
      performance: {
        averageResponseTime: 0,
        slowRequests: 0,
        fastRequests: 0,
      },
      errors: {
        total: 0,
        byType: {},
      },
      cache: {
        hits: 0,
        misses: 0,
      },
    };
    this.responseTimes = [];
  }
}


