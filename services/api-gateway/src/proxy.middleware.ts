// src/proxy.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ProxyService } from './proxy.service';

@Injectable()
export class ProxyMiddleware implements NestMiddleware {
  constructor(private readonly proxyService: ProxyService) {}

  use(req: Request, res: Response, next: NextFunction) {
    this.proxyService.handleRequest(req).subscribe({
      next: (response) => {
        res.status(response.status).set(response.headers).send(response.data);
      },
      error: (err) => {
        res
          .status(err.response?.status || 500)
          .send(err.response?.data || 'Proxy error');
      },
    });
  }
}
