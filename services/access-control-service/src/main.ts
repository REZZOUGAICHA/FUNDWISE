import { NestFactory } from '@nestjs/core';
import { AccessControlModule } from './access-control.module';
import { Logger } from '@nestjs/common';
import { config } from './config';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create( AccessControlModule, { 
    logger: ['error', 'warn', 'log']
  });

   app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  await app.listen(config.port);
  logger.log(`Application is running on port ${config.port}`);
}
bootstrap();
