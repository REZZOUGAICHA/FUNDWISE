import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AuthModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://localhost:5672'], // your RabbitMQ connection
      queue: 'auth_queue',             // your service queue
      queueOptions: {
        durable: false,
      },
    },
  });

  // Start microservices (RMQ, etc.)
  await app.startAllMicroservices();

  // Enable CORS
  app.enableCors({
    origin: 'http://localhost:443',
    credentials: true,
  });

  // Start the HTTP server
  await app.listen(process.env.PORT ?? 3001);

  console.log(`Auth service running on port ${process.env.PORT ?? 3001}`);
}
bootstrap();
