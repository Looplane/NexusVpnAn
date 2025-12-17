import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AppLoggerService, LogContext } from '../services/logger.service';
import { MetricsService } from '../services/metrics.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    private readonly logger: AppLoggerService,
    private readonly metrics: MetricsService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { method, url, ip, headers } = request;
    const now = Date.now();

    // Build log context
    const logContext: LogContext = {
      requestId: request.id || headers['x-request-id'],
      userId: request.user?.userId,
      ip: ip || headers['x-forwarded-for'] || 'unknown',
      userAgent: headers['user-agent'],
      method,
      url,
    };

    return next.handle().pipe(
      tap({
        next: () => {
          const statusCode = response.statusCode;
          const duration = Date.now() - now;
          
          // Record metrics
          this.metrics.recordRequest(method, statusCode, duration);
          
          // Log request with full context
          this.logger.logRequest(method, url, statusCode, duration, logContext);
          
          // Log slow requests as warnings
          if (duration > 1000) {
            this.logger.warn(`Slow request detected: ${method} ${url} took ${duration}ms`, logContext);
          }
        },
        error: (error) => {
          const duration = Date.now() - now;
          const statusCode = response.statusCode || 500;
          
          // Record metrics
          this.metrics.recordRequest(method, statusCode, duration);
          this.metrics.recordError(error.constructor?.name || 'UnknownError');
          
          // Log error request
          this.logger.logRequest(method, url, statusCode, duration, logContext);
          
          // Log error with full context
          this.logger.logError(error, logContext);
        },
      }),
    );
  }
}

