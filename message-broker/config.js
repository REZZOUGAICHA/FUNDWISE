module.exports = {
  environment: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'info',
  messageBroker: {
    url: 'amqp://guest:guest@localhost:5672',
    maxRetries: 5,
    retryInterval: 5000,
    exchanges: {
      campaign: 'campaign',
      donation: 'donation',
      verification: 'verification'
    }
  }
}; 