import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseDto<T = any> {
  @ApiProperty({ description: 'Response status code', example: 200 })
  statusCode: number;

  @ApiProperty({ description: 'Response message', example: 'Success' })
  message: string;

  @ApiProperty({ description: 'Response data', required: false })
  data?: T;

  @ApiProperty({ description: 'Request ID for tracking', required: false })
  requestId?: string;

  @ApiProperty({ description: 'Response timestamp', example: '2025-12-17T04:16:33.000Z' })
  timestamp: string;

  constructor(statusCode: number, message: string, data?: T, requestId?: string) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.requestId = requestId;
    this.timestamp = new Date().toISOString();
  }
}

