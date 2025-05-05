/**
 * Logger Utility
 * 
 * Centralized logging for the message broker.
 */

const winston = require('winston');
const config = require('../../config');

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Create the logger instance
const logger = winston.createLogger({
  level: config.logLevel,
  format: logFormat,
  defaultMeta: { service: 'message-broker' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ level, message, timestamp, ...metadata }) => {
          let metaStr = '';
          if (Object.keys(metadata).length > 0 && metadata.service) {
            if (Object.keys(metadata).length > 1) {
              const { service, ...rest } = metadata;
              metaStr = ` ${JSON.stringify(rest)}`;
            }
            return `[${timestamp}] [${metadata.service}] ${level}: ${message}${metaStr}`;
          }
          return `[${timestamp}] ${level}: ${message}${metaStr}`;
        })
      )
    })
  ]
});

// Add file transport in production
if (config.environment === 'production') {
  logger.add(
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' })
  );
  logger.add(
    new winston.transports.File({ filename: 'logs/combined.log' })
  );
}

module.exports = logger;