import { Controller, Get } from '@nestjs/common';
import {
  HealthCheckService,
  HttpHealthIndicator,
  HealthCheck,
  TypeOrmHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';
import { MetricsService } from '../common/services/metrics.service';

// Health endpoints don't need versioning - they're infrastructure endpoints
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private db: TypeOrmHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
    private metrics: MetricsService,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      // Database connectivity check
      () => this.db.pingCheck('database', { timeout: 3000 }),
      
      // Memory health check - 500MB threshold
      () => this.memory.checkHeap('memory_heap', 500 * 1024 * 1024),
      
      // Disk space check - 80% threshold (warn if > 80% used)
      () => this.disk.checkStorage('storage', { 
        path: process.platform === 'win32' ? 'C:\\' : '/',
        thresholdPercent: 0.8,
      }),
      
      // Internet connectivity (optional, may fail in restricted environments)
      async () => {
        try {
          return await this.http.pingCheck('internet_connectivity', 'https://www.google.com', { timeout: 5000 });
        } catch {
          // Don't fail health check if internet is down, just mark as degraded
          return { internet_connectivity: { status: 'degraded', message: 'Internet connectivity check failed' } } as any;
        }
      },
    ]);
  }

  @Get('liveness')
  liveness() {
    // Simple liveness probe - just returns OK if service is running
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Get('readiness')
  @HealthCheck()
  readiness() {
    // Readiness probe - checks critical dependencies
    return this.health.check([
      () => this.db.pingCheck('database', { timeout: 3000 }),
    ]);
  }

  @Get('metrics')
  getMetrics() {
    const metrics = this.metrics.getMetrics();
    return {
      ...metrics,
      cache: {
        ...metrics.cache,
        hitRate: `${this.metrics.getCacheHitRate()}%`,
      },
    };
  }
}