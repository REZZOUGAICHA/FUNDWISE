import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AuthModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://guest:guest@rabbitmq:5672'], // RabbitMQ connection string
      queue: 'auth_queue', // your queue name
      queueOptions: {
        durable: false
      },
    },
  });

  await app.startAllMicroservices();
  app.enableCors({
    origin: 'http://localhost:443', 
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
