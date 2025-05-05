const BrokerClient = require('../../message-broker/src/lib/broker-client');
const { rabbitmq: config } = require('../../message-broker/src/config');
const logger = require('../../message-broker/src/utils/logger');

class AuthBrokerClient extends BrokerClient {
    constructor() {
        super('auth');
    }

    // Publishing methods
    async publishUserRegistered(userData) {
        await this.publishMessage(
            config.queues.auth.registered,
            {
                ...userData,
                event: 'user.registered',
                timestamp: new Date().toISOString()
            }
        );
    }

    async publishUserLoggedIn(userData) {
        await this.publishMessage(
            config.queues.auth.loggedIn,
            {
                ...userData,
                event: 'user.logged_in',
                timestamp: new Date().toISOString()
            }
        );
    }

    async publishUserLoggedOut(userData) {
        await this.publishMessage(
            config.queues.auth.loggedOut,
            {
                ...userData,
                event: 'user.logged_out',
                timestamp: new Date().toISOString()
            }
        );
    }

    async publishPasswordChanged(userData) {
        await this.publishMessage(
            config.queues.auth.passwordChanged,
            {
                ...userData,
                event: 'user.password_changed',
                timestamp: new Date().toISOString()
            }
        );
    }

    async publishAccountLocked(userData) {
        await this.publishMessage(
            config.queues.auth.accountLocked,
            {
                ...userData,
                event: 'user.account_locked',
                timestamp: new Date().toISOString()
            }
        );
    }

    // Consuming methods
    async consumeUserRegistrations(handler) {
        await this.consume(config.queues.auth.registered, handler);
    }

    async consumeUserLogins(handler) {
        await this.consume(config.queues.auth.loggedIn, handler);
    }

    async consumeUserLogouts(handler) {
        await this.consume(config.queues.auth.loggedOut, handler);
    }

    async consumePasswordChanges(handler) {
        await this.consume(config.queues.auth.passwordChanged, handler);
    }

    async consumeAccountLocks(handler) {
        await this.consume(config.queues.auth.accountLocked, handler);
    }
}

// Export a singleton instance
module.exports = new AuthBrokerClient(); 