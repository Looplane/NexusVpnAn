import { Injectable, LoggerService, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface LogContext {
  requestId?: string;
  userId?: string;
  ip?: string;
  userAgent?: string;
  method?: string;
  url?: string;
  [key: string]: any;
}

@Injectable()
export class AppLoggerService implements LoggerService {
  private readonly logger = new Logger();
  private readonly isProduction: boolean;
  private readonly logLevel: string;

  constructor(private configService: ConfigService) {
    this.isProduction = this.configService.get<string>('NODE_ENV') === 'production';
    this.logLevel = this.configService.get<string>('LOG_LEVEL') || 'info';
  }

  log(message: string, context?: string | LogContext) {
    this.logger.log(this.formatMessage(message, context), this.getContextName(context));
  }

  error(message: string, trace?: string, context?: string | LogContext) {
    const formattedMessage = this.formatMessage(message, context);
    const contextName = this.getContextName(context);
    
    if (this.isProduction) {
      // In production, log as structured JSON
      this.logger.error(JSON.stringify({
        level: 'error',
        message: formattedMessage,
        trace,
        ...this.extractContext(context),
        timestamp: new Date().toISOString(),
      }), contextName);
    } else {
      // In development, log with stack trace
      this.logger.error(formattedMessage, trace, contextName);
    }
  }

  warn(message: string, context?: string | LogContext) {
    this.logger.warn(this.formatMessage(message, context), this.getContextName(context));
  }

  debug(message: string, context?: string | LogContext) {
    if (this.shouldLog('debug')) {
      this.logger.debug(this.formatMessage(message, context), this.getContextName(context));
    }
  }

  verbose(message: string, context?: string | LogContext) {
    if (this.shouldLog('verbose')) {
      this.logger.verbose(this.formatMessage(message, context), this.getContextName(context));
    }
  }

  /**
   * Log performance metrics
   */
  logPerformance(operation: string, duration: number, context?: LogContext) {
    const level = duration > 1000 ? 'warn' : 'log';
    const message = `Performance: ${operation} took ${duration}ms`;
    
    if (this.isProduction) {
      const logData = {
        level: 'performance',
        operation,
        duration,
        ...this.extractContext(context),
        timestamp: new Date().toISOString(),
      };
      
      if (level === 'warn') {
        this.logger.warn(JSON.stringify(logData));
      } else {
        this.logger.log(JSON.stringify(logData));
      }
    } else {
      this.logger[level](message, this.getContextName(context));
    }
  }

  /**
   * Log API request with full context
   */
  logRequest(method: string, url: string, statusCode: number, duration: number, context?: LogContext) {
    const logData = {
      level: 'http',
      method,
      url,
      statusCode,
      duration,
      ...this.extractContext(context),
      timestamp: new Date().toISOString(),
    };

    if (this.isProduction) {
      const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'log';
      this.logger[level](JSON.stringify(logData));
    } else {
      const message = `${method} ${url} ${statusCode} - ${duration}ms`;
      const logLevel = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'log';
      this.logger[logLevel](message, this.getContextName(context));
    }
  }

  /**
   * Log error with full context for APM integration
   */
  logError(error: Error, context?: LogContext) {
    const errorData = {
      level: 'error',
      message: error.message,
      name: error.name,
      stack: error.stack,
      ...this.extractContext(context),
      timestamp: new Date().toISOString(),
    };

    if (this.isProduction) {
      this.logger.error(JSON.stringify(errorData));
    } else {
      this.logger.error(error.message, error.stack, this.getContextName(context));
    }

    // Hook for future APM integration (Sentry, DataDog, etc.)
    this.sendToAPM(error, context);
  }

  private formatMessage(message: string, context?: string | LogContext): string {
    if (typeof context === 'string') {
      return message;
    }
    
    if (context && typeof context === 'object') {
      const contextStr = Object.entries(context)
        .filter(([key]) => !['requestId', 'userId', 'ip', 'userAgent', 'method', 'url'].includes(key))
        .map(([key, value]) => `${key}=${value}`)
        .join(' ');
      
      return contextStr ? `${message} [${contextStr}]` : message;
    }
    
    return message;
  }

  private getContextName(context?: string | LogContext): string {
    if (typeof context === 'string') {
      return context;
    }
    
    if (context && typeof context === 'object') {
      return context.requestId || 'App';
    }
    
    return 'App';
  }

  private extractContext(context?: string | LogContext): Partial<LogContext> {
    if (typeof context === 'string' || !context) {
      return {};
    }
    
    return {
      requestId: context.requestId,
      userId: context.userId,
      ip: context.ip,
      userAgent: context.userAgent,
      method: context.method,
      url: context.url,
    };
  }

  private shouldLog(level: string): boolean {
    const levels = ['verbose', 'debug', 'log', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const requestedLevelIndex = levels.indexOf(level);
    return requestedLevelIndex >= currentLevelIndex;
  }

  /**
   * Hook for APM integration (Sentry, DataDog, etc.)
   * Override this method or extend the service for APM integration
   */
  private sendToAPM(error: Error, context?: LogContext): void {
    // Placeholder for future APM integration
    // Example: Sentry.captureException(error, { extra: context });
    // Example: DataDog.captureException(error, context);
  }
}


