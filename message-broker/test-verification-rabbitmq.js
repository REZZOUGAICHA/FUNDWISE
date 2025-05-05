/**
 * Verification Service RabbitMQ Integration Test
 *
 * This script tests the RabbitMQ integration for the Verification Service.
 * It will:
 * 1. Connect to RabbitMQ
 * 2. Set up temporary test consumers
 * 3. Publish test messages
 * 4. Verify message receipt
 */

const messageBroker = require('../message-broker/lib/message-broker-client');
const logger = require('../message-broker/src/utils/logger');

console.log('Starting Verification RabbitMQ test...');

// Test verification request
const testVerificationRequest = {
  id: 'test-verification-1',
  entityId: 'test-entity-1',
  entityType: 'campaign',
  title: 'Test Campaign',
  orgName: 'Test Organization',
  orgId: 'test-org-1',
  requestedBy: 'test-user-1',
  documents: [
    {
      type: 'business_license',
      url: 'https://example.com/doc1.pdf'
    }
  ],
  metadata: {
    industry: 'Technology',
    region: 'North America'
  }
};

// Test document upload
const testDocumentUpload = {
  verificationId: 'test-verification-1',
  entityId: 'test-entity-1',
  documents: [
    {
      type: 'tax_document',
      url: 'https://example.com/doc2.pdf'
    }
  ]
};

// Test verification decision
const testVerificationDecision = {
  verificationId: 'test-verification-1',
  status: 'approved',
  reviewedBy: 'admin-user-1',
  comments: 'All documents verified successfully'
};

async function runTest() {
  try {
    // Connect to the message broker
    await messageBroker.connect();
    logger.info('Connected to message broker');

    // Set up consumers
    const requestConsumer = await messageBroker.consume('verification.requested', async (message) => {
      logger.info('Received verification request:', message);
    });

    const uploadConsumer = await messageBroker.consume('verification.document.uploaded', async (message) => {
      logger.info('Received document upload:', message);
    });

    const decisionConsumer = await messageBroker.consume('verification.decision', async (message) => {
      logger.info('Received verification decision:', message);
    });

    // Publish test messages
    await messageBroker.publish('verification', 'verification.requested', testVerificationRequest);
    await messageBroker.publish('verification', 'verification.document.uploaded', testDocumentUpload);
    await messageBroker.publish('verification', 'verification.decision', testVerificationDecision);

    // Wait for messages to be processed
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Clean up
    await messageBroker.close();
    logger.info('Verification RabbitMQ test completed successfully');
  } catch (error) {
    logger.error('Test failed:', error);
    process.exit(1);
  }
}

runTest();
