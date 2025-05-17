/**
 * RabbitMQ Configuration
 * 
 * This file contains all configuration settings for the RabbitMQ connection
 * and channel setup, including queues, exchanges, and routing keys.
 */

module.exports = {
    // Connection configuration
    connection: {
      protocol: process.env.RABBITMQ_PROTOCOL || 'amqp',
      hostname: process.env.RABBITMQ_HOST || 'localhost',
      port: parseInt(process.env.RABBITMQ_PORT || '5672', 10),
      username: process.env.RABBITMQ_USERNAME || 'guest',
      password: process.env.RABBITMQ_PASSWORD || 'guest',
      vhost: process.env.RABBITMQ_VHOST || '/',
      connectionTimeout: parseInt(process.env.RABBITMQ_CONNECTION_TIMEOUT || '30000', 10),
      heartbeat: parseInt(process.env.RABBITMQ_HEARTBEAT || '60', 10)
    },
  
    // Exchange configuration
    exchanges: {
      heartbeat: {
  name: 'heartbeat_exchange',
  type: 'topic',
  options: { durable: true }
},
       auth: {                   // add this block
    name: 'auth_exchange',
    type: 'topic',
    options: { durable: true }
  },
        events: {                       // <== Add this
        name: 'events-exchange',
        type: 'topic',
        options: { durable: true }
    },
      donation: {
        name: 'donation_exchange',
        type: 'topic',
        options: { durable: true }
      },
      campaign: {
        name: 'campaign_exchange',
        type: 'topic',
        options: { durable: true }
      },
      verification: {
        name: 'verification_exchange',
        type: 'topic',
        options: { durable: true }
      },
      notification: {
        name: 'notification_exchange',
        type: 'topic',
        options: { durable: true }
      },
      blockchain: {
        name: 'blockchain_exchange',
        type: 'topic',
        options: { durable: true }
      },
      deadLetter: {
        name: 'dl_exchange',
        type: 'direct',
        options: { durable: true }
      }
    },
  
    // Queue configuration
    queues: {
      serviceHeartbeat: {
  name: 'service.heartbeat',
  options: {
    durable: true
  },
  bindingKey: 'heartbeat.#',
  exchange: 'heartbeat_exchange'
},
       authLoginQueue: 
      {
    name: 'auth_login_queue',
    exchange: 'auth_exchange',
    bindingKey: 'auth.login',
    options: { durable: true }
  },
      // Donation queues
      donationCreated: {
        name: 'donation.created',
        options: {
          durable: true,
          deadLetterExchange: 'dl_exchange',
          deadLetterRoutingKey: 'donation.created.dead'
        },
        bindingKey: 'donation.created',
        exchange: 'donation_exchange'
      },
      donationProcessed: {
        name: 'donation.processed',
        options: {
          durable: true,
          deadLetterExchange: 'dl_exchange',
          deadLetterRoutingKey: 'donation.processed.dead'
        },
        bindingKey: 'donation.processed',
        exchange: 'donation_exchange'
      },
      
      // Campaign queues
      campaignCreated: {
        name: 'campaign.created',
        options: {
          durable: true,
          deadLetterExchange: 'dl_exchange',
          deadLetterRoutingKey: 'campaign.created.dead'
        },
        bindingKey: 'campaign.created',
        exchange: 'campaign_exchange'
      },
      campaignUpdated: {
        name: 'campaign.updated',
        options: {
          durable: true,
          deadLetterExchange: 'dl_exchange',
          deadLetterRoutingKey: 'campaign.updated.dead'
        },
        bindingKey: 'campaign.updated',
        exchange: 'campaign_exchange'
      },
      
      // Verification queues
      verificationRequested: {
        name: 'verification.requested',
        options: {
          durable: true,
          deadLetterExchange: 'dl_exchange',
          deadLetterRoutingKey: 'verification.requested.dead'
        },
        bindingKey: 'verification.requested',
        exchange: 'verification_exchange'
      },
      verificationCompleted: {
        name: 'verification.completed',
        options: {
          durable: true,
          deadLetterExchange: 'dl_exchange',
          deadLetterRoutingKey: 'verification.completed.dead'
        },
        bindingKey: 'verification.completed',
        exchange: 'verification_exchange'
      },
      
      // Notification queues
      notificationEmail: {
        name: 'notification.email',
        options: {
          durable: true,
          deadLetterExchange: 'dl_exchange',
          deadLetterRoutingKey: 'notification.email.dead'
        },
        bindingKey: 'notification.email',
        exchange: 'notification_exchange'
      },
      notificationSms: {
        name: 'notification.sms',
        options: {
          durable: true,
          deadLetterExchange: 'dl_exchange',
          deadLetterRoutingKey: 'notification.sms.dead'
        },
        bindingKey: 'notification.sms',
        exchange: 'notification_exchange'
      },
      
      // Blockchain queues
      blockchainTransaction: {
        name: 'blockchain.transaction',
        options: {
          durable: true,
          deadLetterExchange: 'dl_exchange',
          deadLetterRoutingKey: 'blockchain.transaction.dead'
        },
        bindingKey: 'blockchain.transaction',
        exchange: 'blockchain_exchange'
      },
      blockchainConfirmation: {
        name: 'blockchain.confirmation',
        options: {
          durable: true,
          deadLetterExchange: 'dl_exchange',
          deadLetterRoutingKey: 'blockchain.confirmation.dead'
        },
        bindingKey: 'blockchain.confirmation',
        exchange: 'blockchain_exchange'
      },
      
      // Dead letter queues
      deadLetters: {
        name: 'dead_letters',
        options: { durable: true },
        bindingKey: '#.dead',
        exchange: 'dl_exchange'
      }
    },
  
    // Default options for publish
    publishDefaults: {
      persistent: true
    },
    
    // Default options for consume
    consumeDefaults: {
      noAck: false
    }
  };