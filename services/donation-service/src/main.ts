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
      queue: 'donation_queue',
      queueOptions: {
        durable: true,
      },
      noAck: false,
      prefetchCount: 1,
      isGlobalPrefetchCount: true,
      socketOptions: {
        heartbeatIntervalInSeconds: 60,
        reconnectTimeInSeconds: 5,
      },
      // Add custom serializer and deserializer
      serializer: {
        serialize: (value: any) => {
          // Ensure the value is an object with pattern and data properties
          const message = { pattern: value.pattern, data: value.data };
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
                console.log('Raw message received in deserializer (Buffer):', str);
                // Check if the string is actually [object Object]
                if (str === '[object Object]') {
                  console.warn('Received literal string "[object Object]", likely serialization issue upstream');
                  return { pattern: undefined, data: {} };
                }
                try {
                  const parsedMessage = JSON.parse(str);
                  if (parsedMessage && typeof parsedMessage === 'object' && 'pattern' in parsedMessage && 'data' in parsedMessage) {
                    return parsedMessage;
                  }
                  console.warn('Received message with unexpected structure:', parsedMessage);
                  return { pattern: undefined, data: parsedMessage };
                } catch (parseError) {
                  console.error('JSON parse error:', parseError.message);
                  console.error('String content:', str);
                  // Return a safe default value
                  return { pattern: undefined, data: { rawContent: str } };
                }
              } else {
                // If it's already an object but not a Buffer
                console.log('Raw message received in deserializer (Object):', typeof value);
                // Check if it has the expected NestJS message structure
                if ('pattern' in value && 'data' in value) {
                  return value;
                }
                // Otherwise wrap it in the expected structure
                return { pattern: undefined, data: value };
              }
            } else if (typeof value === 'string') {
              // If it's a string, try to parse it
              console.log('Raw message received in deserializer (String):', value);
              try {
                const parsedMessage = JSON.parse(value);
                if (parsedMessage && typeof parsedMessage === 'object' && 'pattern' in parsedMessage && 'data' in parsedMessage) {
                  return parsedMessage;
                }
                return { pattern: undefined, data: parsedMessage };
              } catch (parseError) {
                return { pattern: undefined, data: { rawContent: value } };
              }
            }
            
            // For any other type, wrap it in the expected structure
            return { pattern: undefined, data: value };
          } catch (error) {
            console.error('Deserialization error:', error);
            console.error('Value type:', typeof value);
            console.error('Value content:', value instanceof Buffer ? value.toString() : String(value));
            // Return a safe default with detailed error info
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