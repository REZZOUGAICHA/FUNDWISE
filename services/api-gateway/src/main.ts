import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import * as fs from 'fs';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  // HTTPS setup
  const httpsOptions = {
    key: fs.readFileSync(config.tls.keyPath),
    cert: fs.readFileSync(config.tls.certPath),
  };

  const app = await NestFactory.create(AppModule, { 
    httpsOptions,
    logger: ['error', 'warn', 'log']
  });

  // Security headers
  app.use(helmet());

  // Rate limiting
  app.use(
    rateLimit({
      windowMs: config.rateLimit.windowMs,
      max: config.rateLimit.max,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  // Global request validation
  app.useGlobalPipes(
    new ValidationPipe({ 
      whitelist: true, 
      forbidNonWhitelisted: true, 
      transform: true 
    }),
  );

  // CORS configuration for API gateway
  app.enableCors({
    origin: config.cors.allowedOrigins,
    methods: config.cors.allowedMethods,
    credentials: config.cors.allowCredentials
  });

  await app.listen(config.port);
  logger.log(`Application is running on port ${config.port}`);
}
bootstrap();