import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponseDto } from '../dto/api-response.dto';
import { Request } from 'express';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const requestId = (request as any).requestId;

    return next.handle().pipe(
      map((data) => {
        // Skip transformation for health checks and Swagger docs
        if (
          request.url.includes('/health') ||
          request.url.includes('/api/docs') ||
          request.url === '/'
        ) {
          return data;
        }

        // If already a standard response, return as is
        if (data && typeof data === 'object' && 'statusCode' in data) {
          return data;
        }

        // Transform to standard API response
        const response = new ApiResponseDto(
          200,
          'Success',
          data,
          requestId,
        );

        return response;
      }),
    );
  }
}

