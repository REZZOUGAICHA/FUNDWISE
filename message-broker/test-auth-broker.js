const authBroker = require('../services/auth-service/broker-client');
const notificationBroker = require('../services/notification-service/broker-client');
const logger = require('./src/utils/logger');

async function testAuthBroker() {
    try {
        // Initialize broker clients
        await authBroker.connect();
        await notificationBroker.connect();

        // Set up consumers
        await authBroker.consumeUserRegistrations(async (data) => {
            logger.info('User registered:', data);
            await notificationBroker.publishEmailNotification({
                to: data.email,
                subject: 'Welcome to Fundwise!',
                body: `Welcome ${data.name}! Thank you for registering.`
            });
        });

        await authBroker.consumeUserLogins(async (data) => {
            logger.info('User logged in:', data);
            await notificationBroker.publishEmailNotification({
                to: data.email,
                subject: 'New Login Alert',
                body: `New login detected for your account at ${data.timestamp}`
            });
        });

        await authBroker.consumePasswordChanges(async (data) => {
            logger.info('Password changed:', data);
            await notificationBroker.publishEmailNotification({
                to: data.email,
                subject: 'Password Changed',
                body: 'Your password has been successfully changed.'
            });
        });

        // Publish test messages
        await authBroker.publishUserRegistered({
            id: '123',
            name: 'John Doe',
            email: 'john@example.com'
        });

        await authBroker.publishUserLoggedIn({
            id: '123',
            email: 'john@example.com',
            ip: '192.168.1.1'
        });

        await authBroker.publishPasswordChanged({
            id: '123',
            email: 'john@example.com'
        });

        // Wait for messages to be processed
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Close connections
        await authBroker.close();
        await notificationBroker.close();

        logger.info('Auth broker test completed successfully');
    } catch (error) {
        logger.error('Error in auth broker test:', error);
        process.exit(1);
    }
}

testAuthBroker(); 