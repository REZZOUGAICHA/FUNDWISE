import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Connect to RabbitMQ
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://localhost:5672'],
      queue: 'donation.created',
      queueOptions: {
        durable: true,
        arguments: {
          'x-message-deduplication': true,
          'x-message-ttl': 86400000 // 24 hours in milliseconds
        }
      },
      noAck: false,
      prefetchCount: 1,
      isGlobalPrefetchCount: true,
      socketOptions: {
        heartbeatIntervalInSeconds: 60,
        reconnectTimeInSeconds: 5,
      },
      exchange: 'donation_exchange',
      routingKey: 'donation.created',
      // Add custom serializer and deserializer
      serializer: {
        serialize: (value: any) => {
          // Ensure the value is an object with pattern and data properties
          const message = { 
            pattern: value.pattern, 
            data: value.data,
            id: value.id || crypto.randomUUID()
          };
          return Buffer.from(JSON.stringify(message));
        },
      },
      deserializer: {
        deserialize: (value: any) => {
          try {
            // Check if value is already a parsed object or Buffer
            if (typeof value === 'object' && value !== null) {
              if (Buffer.isBuffer(value)) {
                const str = value.toString();
                try {
                  const parsedMessage = JSON.parse(str);
                  if (parsedMessage && typeof parsedMessage === 'object') {
                    return {
                      pattern: parsedMessage.pattern,
                      data: parsedMessage.data,
                      id: parsedMessage.id
                    };
                  }
                  return { pattern: undefined, data: parsedMessage };
                } catch (parseError) {
                  console.error('JSON parse error:', parseError.message);
                  return { pattern: undefined, data: { rawContent: str } };
                }
              }
              return { 
                pattern: value.pattern, 
                data: value.data,
                id: value.id
              };
            }
            return { pattern: undefined, data: value };
          } catch (error) {
            console.error('Deserialization error:', error);
            return { 
              pattern: undefined, 
              data: { 
                error: true, 
                message: error.message 
              } 
            };
          }
        },
      },
    },
  });

  // Start microservices
  await app.startAllMicroservices();

  // Enable CORS
  app.enableCors({
    origin: 'http://localhost:443',
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3009);
  console.log(`Donation service running on port ${process.env.PORT ?? 3009}`);
}
bootstrap();