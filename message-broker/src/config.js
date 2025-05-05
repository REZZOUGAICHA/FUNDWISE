module.exports = {
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
            }
        },
        queues: {
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