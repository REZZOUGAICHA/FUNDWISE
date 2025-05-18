import * as dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3002', 10),
  
  tls: {
    keyPath: process.env.TLS_KEY_PATH || './secrets/key.pem',
    certPath: process.env.TLS_CERT_PATH || './secrets/cert.pem',
  },
  
};