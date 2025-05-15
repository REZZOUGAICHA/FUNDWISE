import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth.module';

async function bootstrap() {
  const app = await NestFactory.create(AuthModule);
  app.enableCors({
    origin: 'http://localhost:443', 
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
