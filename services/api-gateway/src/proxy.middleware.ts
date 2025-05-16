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
import * as http from 'http';

@Injectable()
export class ProxyMiddleware implements NestMiddleware, OnModuleInit {
  private readonly logger = new Logger(ProxyMiddleware.name);
  private lbCounters = new Map<string, number>();
  private breakers = new Map<string, CircuitBreaker>();
  private healthStatus = new Map<string, boolean>();
  private httpAgent: http.Agent;

  // Service routes configuration
  private readonly routes = {
    '/api/public': ['http://localhost:3000'],
    '/api/auth': ['http://localhost:3002'],
    '/api/private': ['http://localhost:5000'],
  };

  constructor() {
    this.httpAgent = new http.Agent({
      keepAlive: config.proxy.keepAlive,
      maxSockets: config.proxy.maxSockets,
      timeout: config.proxy.timeout,
    });
    
    // Initialize health status for all services
    Object.values(this.routes).flat().forEach(target => {
      this.healthStatus.set(target, true);
    });
  }

  async onModuleInit() {
    try {
      this.logger.log('Initializing API Gateway Circuit Breakers');
      
      for (const [prefix, targets] of Object.entries(this.routes)) {
        for (const target of targets) {
          if (!this.breakers.has(target)) {
            // Create circuit breaker for each target service
            const breaker = new CircuitBreaker(
              async (opts: { req: Request; res: Response; proxyOpts: ProxyOptions }) => {
                return this.doProxy(opts.req, opts.res, opts.proxyOpts);
              },
              {
                timeout: config.circuit.timeout,
                errorThresholdPercentage: config.circuit.errorThreshold,
                resetTimeout: config.circuit.resetTimeout,
                rollingCountTimeout: 60000, 
                capacity: 10, // Allow 10 concurrent requests when half-open
                volumeThreshold: 5, // Min number of requests before trip
              }
            );

            // Configure circuit breaker events
            breaker.on('open', () => {
              this.healthStatus.set(target, false);
              this.logger.warn(`Circuit breaker OPENED for ${target} - Service is considered unhealthy`);
            });

            breaker.on('halfOpen', () => {
              this.logger.log(`Circuit breaker HALF-OPEN for ${target} - Testing the service`);
            });

            breaker.on('close', () => {
              this.healthStatus.set(target, true);
              this.logger.log(`Circuit breaker CLOSED for ${target} - Service is healthy again`);
            });
            
            breaker.on('reject', () => {
              this.logger.warn(`Request REJECTED for ${target} - Circuit is open`);
            });
            
            breaker.on('timeout', (err) => {
              this.logger.warn(`Request TIMED OUT for ${target}: ${err.message}`);
            });
            
            breaker.on('success', () => {
              // Optional: track successful requests
              this.logger.debug(`Request to ${target} completed successfully`);
            });

            breaker.on('fallback', () => {
              this.logger.warn(`Fallback triggered for ${target}`);
            });

            this.breakers.set(target, breaker);
            this.logger.log(`Circuit breaker initialized for ${target}`);
          }
        }
      }

      this.logger.log('API Gateway initialization complete');
      
      // Set up health check interval for proactive monitoring
      setInterval(() => this.checkServicesHealth(), 30000);
      
    } catch (err) {
      this.logger.error(`Failed to initialize circuit breakers: ${err instanceof Error ? err.message : 'Unknown error'}`);
      throw err; // Re-throw to notify NestJS of initialization failure
    }
  }

  /**
   * Proactively check health of services
   * This helps detect issues before user requests fail
   */
  private async checkServicesHealth(): Promise<void> {
    for (const [target, breaker] of this.breakers.entries()) {
      // Only check if circuit is already open
      if (!this.healthStatus.get(target)) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2000);
          
          // Simplified healthcheck request
          const url = new URL(target);
          const options = {
            hostname: url.hostname,
            port: url.port || 80,
            path: '/health', // Assuming a health endpoint
            method: 'GET',
            signal: controller.signal,
            agent: this.httpAgent,
          };
          
          await new Promise<void>((resolve, reject) => {
            const req = http.request(options, (res) => {
              if (res.statusCode === 200) {
                this.logger.log(`Health check passed for ${target}`);
                resolve();
              } else {
                reject(new Error(`Health check failed with status ${res.statusCode}`));
              }
            });
            
            req.on('error', reject);
            req.end();
          });
          
          clearTimeout(timeoutId);
        } catch (error) {
          this.logger.debug(`Health check failed for ${target}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          // Do not update status here - let the circuit breaker handle it
        }
      }
    }
  }

  /**
   * Core proxying function
   * Uses http-proxy-middleware to forward the request and returns a promise
   */
  private doProxy(
    req: Request,
    res: Response,
    opts: ProxyOptions,
  ): Promise<void> {
    const startTime = Date.now();
    const target = opts.target as string;
    
    return new Promise<void>((resolve, reject) => {
      // Check if response has already been sent
      if (res.headersSent) {
        this.logger.warn('Headers already sent, cannot proxy request');
        return reject(new Error('Headers already sent'));
      }
      
      // Custom error handling for the response
      res.on('close', () => {
        if (!res.headersSent && !res.writableEnded) {
          this.logger.warn('Client disconnected before proxy response completed');
          reject(new Error('Client disconnected'));
        }
      });
      
      // Create proxy handler with better timeout and connection settings
      const proxy = createProxyMiddleware({
        ...opts,
        // Use persistent agent for better connection management
        agent: this.httpAgent,
        // Set explicit timeouts
        proxyTimeout: config.proxy.proxyTimeout,
        timeout: config.proxy.timeout,
        
        // More detailed event handlers
        onProxyReq: (proxyReq: { path: any; setHeader: (arg0: string, arg1: string) => void; on: (arg0: string, arg1: (err: any) => void) => void; }, req: { method: any; ip: any; headers: { [x: string]: any; }; }, res: any) => {
          this.logger.debug(`Proxying ${req.method} request to: ${target}${proxyReq.path}`);
          
          // Add custom headers
          proxyReq.setHeader('X-Gateway-Timestamp', Date.now().toString());
          proxyReq.setHeader('X-Forwarded-For', req.ip);
          
          if ((req as any).user) {
            proxyReq.setHeader('X-User-ID', (req as any).user.userId || '');
          }
          
          const requestId = req.headers['x-request-id'];
          if (requestId) {
            proxyReq.setHeader('X-Request-ID', requestId);
          }
          
          // Handle stream errors
          proxyReq.on('error', (err: { message: any; }) => {
            this.logger.error(`Proxy request stream error: ${err.message}`);
            reject(err);
          });
        },
        
        onProxyRes: (proxyRes: { statusCode: any; headers: { [x: string]: string; }; }, req: any, res: any) => {
          const responseTime = Date.now() - startTime;
          this.logger.debug(`Received ${proxyRes.statusCode} response from ${target} in ${responseTime}ms`);
          
          // Add gateway tracking headers to response
          proxyRes.headers['x-gateway-response-time'] = responseTime.toString();
          
          // Resolve the promise when we've received the response headers
          // This ensures the circuit breaker gets notified quickly
          resolve();
        },
        
        onError: (err: { message: any; }, req: any, res: { headersSent: any; writeHead: (arg0: number, arg1: { 'Content-Type': string; }) => void; end: (arg0: string) => void; }) => {
          const responseTime = Date.now() - startTime;
          this.logger.error(`Proxy error for ${target} after ${responseTime}ms: ${err.message}`);
          
          // Only send error response if headers not already sent
          if (!res.headersSent) {
            res.writeHead(502, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
              error: 'Bad Gateway', 
              message: 'Unable to communicate with service'
            }));
          }
          
          reject(err);
        }
      } as unknown as ProxyOptions);
      
      // Execute the proxy
      proxy(req, res, (err) => {
        if (err) {
          this.logger.error(`Proxy middleware error: ${err.message}`);
          reject(err);
        }
      });
    });
  }

  /**
   * Main middleware function
   * Handles request routing, load balancing, and circuit breaking
   */
  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();
    
    try {
      // Check for token presence on private routes
      if (req.path.startsWith('/api/private')) {
        const authHeader = req.headers.authorization || '';
        const [scheme, token] = authHeader.split(' ');
        
        if (scheme !== 'Bearer' || !token) {
          throw new UnauthorizedException('Authorization required for this resource');
        }
      }

      // Determine route prefix
      let prefix = '/api/public';
      if (req.path.startsWith('/api/auth')) {
        prefix = '/api/auth';
      } else if (req.path.startsWith('/api/private')) {
        prefix = '/api/private';
      }

      // Get target service(s) for the route
      const targets = this.routes[prefix as keyof typeof this.routes] || [];   
      if (!targets.length) {
        this.logger.warn(`No targets available for prefix: ${prefix}`);
        return res.status(502).json({ error: 'No upstream service available' });
      }

      // Filter to only include healthy targets
      const healthyTargets = targets.filter(target => this.healthStatus.get(target) !== false);
      
      if (!healthyTargets.length) {
        this.logger.warn(`No healthy targets available for prefix: ${prefix}`);
        return res.status(503).json({ 
          error: 'Service temporarily unavailable',
          retry: true
        });
      }

      // Round-robin load balancing among healthy targets
      const key = healthyTargets.join(',');
      const idx = (this.lbCounters.get(key) || 0) % healthyTargets.length;
      this.lbCounters.set(key, idx + 1);
      const target = healthyTargets[idx];

      // Get circuit breaker for the target
      const circuit = this.breakers.get(target);
      if (!circuit) {
        this.logger.error(`No circuit breaker for target: ${target}`);
        return res.status(500).json({ error: 'Gateway configuration error' });
      }

      // Configure proxy options
      const proxyOpts: ProxyOptions = {
        target,
        changeOrigin: true,
        pathRewrite: prefix === '/api/auth' ? { '^/api/auth': '/auth' } : { '^/api': '' },        followRedirects: true, // Follow redirects from services
      };

      // Log the request
      this.logger.log(`${req.method} ${req.path} -> ${target}`);
      
      // Execute proxy with circuit breaker and better error handling
      circuit.fire({ req, res, proxyOpts })
        .then(() => {
          const totalTime = Date.now() - startTime;
          this.logger.debug(`Request completed in ${totalTime}ms: ${req.method} ${req.path}`);
        })
        .catch((err) => {
          const totalTime = Date.now() - startTime;
          this.logger.warn(`Request failed after ${totalTime}ms: ${req.method} ${req.path}`);
          
          // Only send error response if one hasn't been sent already
          if (!res.headersSent) {
            res.status(503).json({ 
              error: 'Service temporarily unavailable',
              message: 'The requested service is currently unavailable',
              retry: true
            });
          }
        });
    } catch (err) {
      if (err instanceof UnauthorizedException) {
        return res.status(401).json({ error: 'Unauthorized', message: err.message });
      }
      
      this.logger.error(`Gateway error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      
      // Only send error response if one hasn't been sent already
      if (!res.headersSent) {
        return res.status(500).json({ error: 'Internal gateway error' });
      }
    }
  }
}
