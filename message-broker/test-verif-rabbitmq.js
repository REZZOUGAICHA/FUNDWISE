// tests/test-verification-consumer.js

const VerificationConsumer = require('../services/verification/consumer');
const verificationService = require('../services/verification-service');

jest.mock('../services/verification-service');
jest.mock('../services/notification/producer');

describe('VerificationConsumer', () => {
  let consumer;

  beforeEach(() => {
    consumer = new VerificationConsumer();
    jest.clearAllMocks();
  });

  it('should initialize all queues without error', async () => {
    consumer.consume = jest.fn(); // mock base consumer method
    await expect(consumer.initialize()).resolves.not.toThrow();
    expect(consumer.consume).toHaveBeenCalledTimes(3); // 3 queues
  });

  it('should handle verification.requested message', async () => {
    const mockMessage = {
      id: 'vr-123',
      entityId: 'campaign-001',
      entityType: 'campaign',
      title: 'Save the Forest',
      orgName: 'EcoOrg',
      orgId: 'org-001',
      requestedBy: 'admin@eco.org',
      documents: [],
      metadata: {},
    };

    consumer.consume = async (_, callback) => await callback(mockMessage);

    verificationService.createVerificationRequest.mockResolvedValue({ id: 'vr-123' });
    verificationService.attemptAutoVerification.mockResolvedValue({ success: true });

    await consumer.consumeVerificationRequested();

    expect(verificationService.createVerificationRequest).toHaveBeenCalled();
    expect(verificationService.approveVerification).toHaveBeenCalledWith('vr-123', 'system', 'Auto-verification passed');
  });
});
