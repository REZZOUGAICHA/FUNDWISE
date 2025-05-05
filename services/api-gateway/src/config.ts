import * as dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '443', 10),
  
  tls: {
    keyPath: process.env.TLS_KEY_PATH || './secrets/key.pem',
    certPath: process.env.TLS_CERT_PATH || './secrets/cert.pem',
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || '',
  },
  
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  },
  
  circuit: {
    timeout: 5000,
    errorThreshold: 50,
    resetTimeout: 10000,
  },
  
  cors: {
    allowedOrigins: process.env.CORS_ALLOWED_ORIGINS?.split(',') || ['*'],
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowCredentials: process.env.CORS_ALLOW_CREDENTIALS === 'true'
  }
};