import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from './config'
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule, { 
    logger: ['error', 'warn', 'log']
  });

  app.use(require('body-parser').urlencoded({ extended: true }));

  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });
  
  await app.listen(config.port ?? 3002);
  logger.log(`Auth service running on port ${config.port ?? 3002}`);
}
bootstrap();
