import {
  Injectable,
  NestMiddleware,
  Logger,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { createProxyMiddleware, RequestHandler, Options as ProxyOptions } from 'http-proxy-middleware';
import CircuitBreaker = require('opossum');
import { config } from './config';

interface ServiceRegistry {
  [prefix: string]: string[];
}

@Injectable()
export class ProxyMiddleware implements NestMiddleware, OnModuleInit {
  private readonly logger = new Logger(ProxyMiddleware.name);
  private lbCounters = new Map<string, number>();
  private breakers = new Map<string, CircuitBreaker>();

  //services routes
  private readonly routes = {
    '/api/public': ['http://localhost:3000'],
    '/api/auth': ['http://localhost:3001'],
    '/api/private': ['http://localhost:5000'],
  };

  async onModuleInit() {
    try{
    for (const [prefix, targets] of Object.entries(this.routes)) {
      for (const url of targets) {
        if (!this.breakers.has(url)) {
          const breaker = new CircuitBreaker(
            (opts: { req: Request; res: Response; proxyOpts: ProxyOptions }) =>
              this.doProxy(opts.req, opts.res, opts.proxyOpts),
            {
              timeout: config.circuit.timeout,
              errorThresholdPercentage: config.circuit.errorThreshold,
              resetTimeout: config.circuit.resetTimeout,
            }
          );

          breaker.on('open', () => {
            this.logger.warn(`Circuit breaker opened for ${url}`);
          });

          breaker.on('close', () => {
            this.logger.log(`Circuit breaker closed for ${url}`);
          });

          this.breakers.set(url, breaker);
        }
      }
    }

    this.logger.log('Circuit breakers initialized from routes');
  } catch (err) {
    this.logger.error(`Failed to initialize circuit breakers: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
  }

  

  private doProxy(
    req: Request,
    res: Response,
    opts: ProxyOptions,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      // Create the proxy handler
      const proxy = createProxyMiddleware(opts) as RequestHandler;
      
      // Event listener to the underlying proxy instance
      const proxyHandler = proxy as unknown as {
        on(event: string, listener: (...args: any[]) => void): void;
      };
      
      proxyHandler.on('error', (err) => reject(err));
      proxyHandler.on('proxyRes', () => resolve());
      
      proxy(req, res, (err) => (err ? reject(err) : resolve()));
    });
  }

  use(req: Request, res: Response, next: NextFunction) {
    try {
      // Check for token presence on private routes
      if (req.path.startsWith('/api/private')) {
        const authHeader = req.headers.authorization || '';
        const [scheme, token] = authHeader.split(' ');
        
        if (scheme !== 'Bearer' || !token) {
          throw new UnauthorizedException('Authorization required for this resource');
        }
      }

      // Routes targets
      let prefix = '/api/public';
      if (req.path.startsWith('/api/auth')) {
        prefix = '/api/auth';
      } else if (req.path.startsWith('/api/private')) {
        prefix = '/api/private';
      }

      const targets = this.routes[prefix as keyof typeof this.routes] || [];   
      if (!targets.length) {
        this.logger.warn(`No targets available for prefix: ${prefix}`);
        return res.status(502).json({ error: 'No upstream service available' });
      }

      // Round-robin load balancing
      const key = targets.join(',');
      const idx = (this.lbCounters.get(key) || 0) % targets.length;
      this.lbCounters.set(key, idx + 1);
      const target = targets[idx];

      // Circuit breaker for the target
      const circuit = this.breakers.get(target);
      if (!circuit) {
        this.logger.error(`No circuit breaker for target: ${target}`);
        return res.status(500).json({ error: 'Gateway configuration error' });
      }

      // Proxy options
      const proxyOpts: ProxyOptions = {
        target,
        secure: false,
        changeOrigin: true,
        pathRewrite: { '^/api': '' },
        onProxyReq: (proxyReq: any) => {
          proxyReq.setHeader('X-Gateway-Timestamp', Date.now().toString());
          proxyReq.setHeader('X-Forwarded-For', req.ip);
          
          if ((req as any).user) {
            proxyReq.setHeader('X-User-ID', (req as any).user.userId || '');
          }
          
          const requestId = req.headers['x-request-id'];
          if (requestId) {
            proxyReq.setHeader('X-Request-ID', requestId);
          }
        }
      } as ProxyOptions & {
        onProxyReq: (proxyReq: any) => void;
      };

      // Execute proxy with circuit breaker
      circuit.fire({ req, res, proxyOpts }).catch((err) => {
        this.logger.warn(`Circuit breaker opened for ${target}: ${err.message}`);
        res.status(503).json({ 
          error: 'Service temporarily unavailable',
          retry: true
        });
      });
    } catch (err) {
      this.logger.error(`Proxy error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      return res.status(500).json({ error: 'Internal gateway error' });
    }
  }
}