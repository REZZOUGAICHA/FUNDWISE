import * as dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3003', 10),
  
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
    timeout: 60000,       
    errorThreshold: 50,    // Percentage of failures before opening
    resetTimeout: 60000,   // How long to wait before trying again
  },
  proxy: {
    timeout: 60000,        // Slightly higher than circuit timeout
    proxyTimeout: 60000,   
    keepAlive: true,
    maxSockets: 100,
  },
  
  cors: {
    allowedOrigins: 'http://localhost:3000',
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowCredentials: process.env.CORS_ALLOW_CREDENTIALS === 'true'
  }
};