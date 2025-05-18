import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { config } from './config';
import rateLimitLib from 'express-rate-limit';


async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule, { 
    logger: ['error', 'warn', 'log']
  });

    app.use(
    '/api',
    rateLimitLib({
      windowMs: 60 * 1000, // 60 seconds
      max: 10,             // limit each IP to 10 requests per windowMs
      message: 'Too many requests, please try again later.',
    }),
  );

  app.enableCors({
    origin: ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  await app.listen(config.port);
  logger.log(`Application is running on port ${config.port}`);
}
bootstrap();

function rateLimit(arg0: {
  windowMs: number; // 60 seconds
  max: number; // limit each IP to 10 requests per windowMs
  message: string;
}): any {
  throw new Error('Function not implemented.');
}
