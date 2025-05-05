/**
 * Configuration index file
 * 
 * Export all configuration modules from a single point
 */

const rabbitmq = require('./rabbitmq');

module.exports = {
  rabbitmq,
  environment: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'info'
};