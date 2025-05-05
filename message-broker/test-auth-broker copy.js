const authBroker = require('./src/services/auth/broker-client');
const notificationBroker = require('./src/services/notification/broker-client');
const logger = require('../message-broker/src/utils/logger');

async function testAuthBroker() {
    try {
        // Initialize broker clients
        await authBroker.connect();
        await notificationBroker.connect();

        logger.info('Starting auth broker test...');

        // Set up auth event consumers
        await authBroker.consumeUserRegistrations(async (user) => {
            logger.info('User registered:', user);
            
            // Send welcome email
            await notificationBroker.publishEmailNotification({
                recipient: user.email,
                subject: 'Welcome to Fundwise!',
                template: 'welcome_email',
                data: {
                    name: user.name,
                    userId: user.id
                }
            });
        });

        await authBroker.consumeUserLogins(async (login) => {
            logger.info('User logged in:', login);
            
            // Send security notification
            await notificationBroker.publishEmailNotification({
                recipient: login.email,
                subject: 'New Login Detected',
                template: 'login_alert',
                data: {
                    userId: login.userId,
                    sessionId: login.sessionId,
                    timestamp: login.timestamp
                }
            });
        });

        await authBroker.consumePasswordChanges(async (change) => {
            logger.info('Password changed:', change);
            
            // Send confirmation email
            await notificationBroker.publishEmailNotification({
                recipient: change.email,
                subject: 'Password Changed',
                template: 'password_changed',
                data: {
                    userId: change.userId,
                    timestamp: change.timestamp
                }
            });
        });

        // Publish test messages
        await authBroker.publishUserRegistered({
            id: 'user-1',
            email: 'test@example.com',
            name: 'Test User'
        });

        await authBroker.publishUserLoggedIn('user-1', 'session-123');

        await authBroker.publishPasswordChanged('user-1');

        logger.info('Test messages published successfully');

        // Wait for messages to be processed
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Clean up
        await authBroker.close();
        await notificationBroker.close();
        logger.info('Auth broker test completed successfully');
    } catch (error) {
        logger.error(`Error in auth broker test: ${error.message}`);
        throw error;
    }
}

// Run the test
testAuthBroker().catch(error => {
    logger.error(`Test failed: ${error.message}`);
    process.exit(1);
}); 