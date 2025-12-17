/**
 * Global HTTP Exception Filter
 * 
 * Catches all exceptions thrown by the application and formats them into consistent HTTP responses.
 * Provides comprehensive logging with request context for debugging and monitoring.
 * 
 * Features:
 * - Handles both HttpException and generic Error instances
 * - Extracts and logs request context (IP, user agent, request ID, etc.)
 * - Differentiates between server errors (500+) and client errors (400-499)
 * - Hides stack traces in production for security
 * - Properly handles X-Forwarded-For header for accurate IP extraction behind proxies
 * 
 * @fix Fixed variable shadowing issue (error -> errorInstance)
 * @fix Improved IP extraction logic to handle string/array types from headers
 */
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AppLoggerService, LogContext } from '../services/logger.service';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: AppLoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error: string | object = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        error = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || exception.message;
        error = exceptionResponse;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      error = exception.name;
    }

    // Build log context with proper type handling
    // Extract request ID from header (can be string, array, or undefined)
    const requestIdHeader = request.headers['x-request-id'];
    const forwardedFor = request.headers['x-forwarded-for'];
    
    // Extract IP address with fallback logic
    // Priority: request.ip (from Express trust proxy) -> X-Forwarded-For header -> 'unknown'
    // @fix Improved IP extraction to handle both string and array types from X-Forwarded-For header
    let ipValue = request.ip || 'unknown';
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
      userId: (request as any).user?.userId,
      ip: ipValue,
      userAgent: typeof request.headers['user-agent'] === 'string' ? request.headers['user-agent'] : undefined,
      method: request.method,
      url: request.url,
    };

    // Log based on severity level
    if (status >= 500) {
      // Server errors (500+) - log full error details for debugging
      // @fix Renamed 'error' to 'errorInstance' to avoid variable shadowing with outer scope
      const errorInstance = exception instanceof Error ? exception : new Error(String(exception));
      this.logger.logError(errorInstance, logContext);
    } else if (status >= 400) {
      // Client errors (400-499) - log as warning (user input issues, not system failures)
      this.logger.warn(`Client error: ${message}`, logContext);
    }

    // Don't expose stack trace in production
    const isProduction = process.env.NODE_ENV === 'production';
    const responseBody: any = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    };

    if (!isProduction && exception instanceof Error) {
      responseBody.error = error;
      responseBody.stack = exception.stack;
    }

    response.status(status).json(responseBody);
  }
}

