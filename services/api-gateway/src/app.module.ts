import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ProxyMiddleware } from './proxy.middleware';
import { HealthController } from './health.controller';

@Module({
  controllers: [HealthController],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ProxyMiddleware)
      .forRoutes({ path: '/api/*', method: RequestMethod.ALL });
  }
}