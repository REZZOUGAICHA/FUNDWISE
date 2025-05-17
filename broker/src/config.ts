export const config = {
  rabbitmq: {
    connection: 'amqp://localhost',
    exchanges: {
      auth: {
        name: 'auth_exchange',
        type: 'topic',
        options: {
          durable: true
        }
      },
      notification: {
        name: 'notification_exchange',
        type: 'topic',
        options: {
          durable: true
        }
      },
      donation: {
        name: 'donation_exchange',
        type: 'topic',
        options: {
          durable: true
        }
      },
      events: {
        name: 'events-exchange',
        type: 'topic',
        options: {
          durable: true
        }
      }
    },
    queues: {
      'critical-events': {
        name: 'critical-events',
        exchange: 'events-exchange',
        bindingKey: 'critical.*',
        options: {
          durable: true,
          maxPriority: 10
        }
      },
      'metrics-events': {
        name: 'metrics-events',
        exchange: 'events-exchange',
        bindingKey: 'metrics.*',
        options: {
          durable: false,
          messageTtl: 30000 // 30 seconds TTL
        }
      },
      'user-events': {
        name: 'user-events',
        exchange: 'events-exchange',
        bindingKey: 'user.*',
        options: {
          durable: true,
          messageTtl: 120000 // 2 minutes TTL
        }
      },
    },
    routingKeys: {
      auth: {
        registered: 'auth.user.registered',
        loggedIn: 'auth.user.logged_in',
        loggedOut: 'auth.user.logged_out',
        passwordChanged: 'auth.user.password_changed',
        accountLocked: 'auth.user.account_locked'
      },
      notification: {
        email: 'notification.email',
        sms: 'notification.sms',
        push: 'notification.push'
      },
      donation: {
        new: 'donation.new',
        status: 'donation.status',
        refund: 'donation.refund'
      }
    }
  },
  environment: process.env.NODE_ENV || 'development'
};