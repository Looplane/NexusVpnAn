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

    // Build log context
    const requestIdHeader = request.headers['x-request-id'];
    const forwardedFor = request.headers['x-forwarded-for'];
    const ipValue = request.ip || 
      (typeof forwardedFor === 'string' ? forwardedFor : Array.isArray(forwardedFor) ? forwardedFor[0] : 'unknown') || 
      'unknown';
    
    const logContext: LogContext = {
      requestId: typeof requestIdHeader === 'string' ? requestIdHeader : Array.isArray(requestIdHeader) ? requestIdHeader[0] : undefined,
      userId: (request as any).user?.userId,
      ip: ipValue,
      userAgent: typeof request.headers['user-agent'] === 'string' ? request.headers['user-agent'] : undefined,
      method: request.method,
      url: request.url,
    };

    // Log based on severity
    if (status >= 500) {
      // Server errors - log full error details
      const error = exception instanceof Error ? exception : new Error(String(exception));
      this.logger.logError(error, logContext);
    } else if (status >= 400) {
      // Client errors - log as warning
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

