import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Get request ID from header or generate new one
    const requestId = req.headers['x-request-id'] as string || uuidv4();
    
    // Attach to request object
    (req as any).requestId = requestId;
    
    // Add to response header
    res.setHeader('X-Request-ID', requestId);
    
    next();
  }
}

