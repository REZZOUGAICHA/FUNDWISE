import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ProxyMiddleware } from './proxy.middleware';
import { ProxyService } from './proxy.service';
import { HealthController } from './health.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    HttpModule,
  ],
  controllers: [HealthController],
  providers: [
    ProxyService,
    {
      provide: 'CAMPAIGN_SERVICE_URL',
      useFactory: (config: ConfigService) =>
        config.get<string>('CAMPAIGN_SERVICE_URL'),
      inject: [ConfigService],
    },
    {
      provide: 'DONATION_SERVICE_URL',
      useFactory: (config: ConfigService) =>
        config.get<string>('DONATION_SERVICE_URL'),
      inject: [ConfigService],
    },
    {
      provide: 'AUTH_SERVICE_URL',
      useFactory: (config: ConfigService) =>
        config.get<string>('AUTH_SERVICE_URL'),
      inject: [ConfigService],
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ProxyMiddleware)
      .forRoutes({ path: '/api/*', method: RequestMethod.ALL });
  }
}
