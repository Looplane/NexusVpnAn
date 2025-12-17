/**
 * Logging Interceptor
 * 
 * Intercepts all HTTP requests and responses to provide comprehensive logging and metrics.
 * Records request duration, status codes, and error information for monitoring and debugging.
 * 
 * Features:
 * - Logs all requests with full context (IP, user agent, request ID, etc.)
 * - Records performance metrics (duration, status codes)
 * - Detects and warns about slow requests (>1000ms)
 * - Handles both successful and error responses
 * - Properly extracts IP from X-Forwarded-For header for proxy environments
 * 
 * @fix Improved IP extraction logic to handle string/array types from headers
 * @fix Added proper type handling for request ID and user agent headers
 */
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

    // Build log context with proper type handling
    // Extract headers that may be string, array, or undefined
    const requestIdHeader = headers['x-request-id'];
    const forwardedFor = headers['x-forwarded-for'];
    
    // Extract IP address with fallback logic
    // Priority: request.ip (from Express trust proxy) -> X-Forwarded-For header -> 'unknown'
    // @fix Improved IP extraction to handle both string and array types from X-Forwarded-For header
    let ipValue = ip || 'unknown';
    if (!ipValue || ipValue === 'unknown') {
      if (typeof forwardedFor === 'string') {
        ipValue = forwardedFor || 'unknown';
      } else if (Array.isArray(forwardedFor) && forwardedFor.length > 0) {
        // Take first IP from array (first is usually the original client IP)
        ipValue = forwardedFor[0] || 'unknown';
      }
    }
    
    const logContext: LogContext = {
      requestId: typeof requestIdHeader === 'string' ? requestIdHeader : Array.isArray(requestIdHeader) ? requestIdHeader[0] : undefined,
      userId: request.user?.userId,
      ip: ipValue,
      userAgent: typeof headers['user-agent'] === 'string' ? headers['user-agent'] : undefined,
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

