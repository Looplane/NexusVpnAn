import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, ClassSerializerInterceptor, Logger, VersioningType } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import * as compression from 'compression';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { AppLoggerService } from './common/services/logger.service';
import { MetricsService } from './common/services/metrics.service';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  // Configure raw body for Stripe webhooks (required for signature verification)
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });

  // API Versioning - URL-based versioning (e.g., /api/v1/users)
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Set Global Prefix
  app.setGlobalPrefix('api', {
    exclude: ['/'],
  });

  // Security Headers
  app.use(helmet());

  // Compression
  app.use(compression());

  // Trust proxy for correct IP handling behind reverse proxies (Render, Nginx, etc.)
  // This ensures request.ip correctly extracts from X-Forwarded-For header
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', true);

  // CORS - Handle Production Domains
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      const allowedOrigins = [frontendUrl, 'http://localhost:5173', 'https://nexusvpn.vercel.app'];
      if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        logger.warn(`Blocked CORS for origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Global Validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));

  // Global Serialization
  const appLogger = app.get(AppLoggerService);
  const metricsService = app.get(MetricsService);
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector)),
    new LoggingInterceptor(appLogger, metricsService),
  );

  // Global Exception Filter (injected via app context)
  const httpExceptionFilter = app.get(HttpExceptionFilter);
  app.useGlobalFilters(httpExceptionFilter);

  // Swagger API Documentation with Versioning
  const config = new DocumentBuilder()
    .setTitle('NexusVPN API')
    .setDescription('The NexusVPN SaaS API description')
    .setVersion('1.0')
    .addBearerAuth()
    .addServer('/api/v1', 'API Version 1')
    .addServer('/api', 'Default (Version 1)')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Stripe Webhook Raw Body Parsing
  // Note: Stripe webhooks require raw body for signature verification
  // The webhook endpoint is excluded from JSON body parsing in the controller
  
  // Use PORT env var for PaaS (Render/Railway)
  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`🚀 Application is running on port: ${port}`);
  logger.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
  logger.log(`🏥 Health Check: http://localhost:${port}/api/health`);
  
  if (process.env.NODE_ENV === 'production') {
    logger.log('✅ Production mode enabled');
  } else {
    logger.log('🔧 Development mode enabled');
  }
}
bootstrap();