import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express';
import * as path from 'node:path';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Enable graceful shutdown hooks for SIGTERM / SIGINT
  app.enableShutdownHooks();

  // Configure reverse proxy trust
  const expressApp = app.getHttpAdapter().getInstance();
  const trustProxyEnv = process.env.TRUST_PROXY || '1';
  expressApp.set('trust proxy', trustProxyEnv === '1' || trustProxyEnv === 'true');

  // Configure payload body size limits (>= 25 MB for screenshots & audio notes)
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ limit: '25mb', extended: true }));
  app.use(express.raw({ limit: '25mb', type: ['application/octet-stream', 'image/*', 'audio/*'] }));

  app.setGlobalPrefix('api/v1');

  // Static storage serving for local driver fallback
  const storageRoot = path.resolve(process.cwd(), process.env.UPLOAD_DIR || '.storage');
  app.use('/static', express.static(storageRoot));

  // Global filters & interceptors
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new LoggingInterceptor(), new ResponseInterceptor());

  // CORS configuration
  const allowedOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim())
    : '*';

  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Swagger Documentation Setup at /docs
  const swaggerConfig = new DocumentBuilder()
    .setTitle('DoIt API')
    .setDescription('DoIt Tasks & Bug Capture backend REST contract and OpenAPI specifications')
    .setVersion('0.1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter your Bearer access token',
        in: 'header',
      },
      'bearer-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`DoIt API is running on: http://localhost:${port}/api/v1`);
  logger.log(`Swagger documentation available at: http://localhost:${port}/docs`);
}

bootstrap();
