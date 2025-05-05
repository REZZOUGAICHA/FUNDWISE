const Consumer = require('../../message-broker/src/lib/consumer');
const { rabbitmq: config } = require('../../message-broker/config');
const logger = require('../../message-broker/src/utils/logger');
const verificationService = require('../verification-service');

class VerificationConsumer extends Consumer {
    async initialize() {
        try {
            // Set up consumer for verification requests
            await this.consumeVerificationRequested();
            
            // Set up consumer for document uploads
            await this.consumeDocumentUploaded();
            
            // Set up consumer for approvals/rejections
            await this.consumeVerificationDecision();
            
            logger.info('Verification consumer initialized successfully');
        } catch (error) {
            logger.error(`Failed to initialize verification consumer: ${error.message}`);
            throw error;
        }
    }

    async consumeVerificationRequested() {
        const queue = config.queues.verification.requested;
        
        await this.consume(queue, async (message) => {
            try {
                logger.info(`Processing verification request for ${message.entityType} ID: ${message.entityId}`);
                
                // Create verification request
                const verificationRequest = await verificationService.createVerificationRequest({
                    id: message.id,
                    entityId: message.entityId,
                    entityType: message.entityType,
                    title: message.title,
                    orgName: message.orgName,
                    orgId: message.orgId,
                    requestedBy: message.requestedBy,
                    documents: message.documents,
                    metadata: message.metadata,
                    status: 'pending'
                });
                
                // Attempt auto-verification
                const autoVerificationResult = await verificationService.attemptAutoVerification(verificationRequest);
                
                if (autoVerificationResult.success) {
                    await verificationService.approveVerification(
                        verificationRequest.id,
                        'system',
                        'Auto-verification passed'
                    );
                } else if (autoVerificationResult.requiresManualReview) {
                    await verificationService.queueForManualReview(verificationRequest.id);
                    await verificationService.notifyAdminAboutPendingVerification(verificationRequest);
                } else if (autoVerificationResult.requiresAdditionalDocuments) {
                    const verificationProducer = require('./producer');
                    await verificationProducer.publishDocumentRequest(
                        verificationRequest.id,
                        message.entityId,
                        autoVerificationResult.requiredDocumentTypes,
                        autoVerificationResult.reason
                    );
                    await verificationService.updateVerificationStatus(
                        verificationRequest.id,
                        'additional_documents_required'
                    );
                } else {
                    await verificationService.rejectVerification(
                        verificationRequest.id,
                        'system',
                        autoVerificationResult.reason || 'Failed automatic verification checks'
                    );
                }
            } catch (error) {
                logger.error(`Error processing verification request: ${error.message}`);
                throw error;
            }
        });
    }

    async consumeDocumentUploaded() {
        const queue = config.queues.verification.documentUploaded;
        
        await this.consume(queue, async (message) => {
            try {
                logger.info(`Processing document upload for verification ID: ${message.verificationId}`);
                
                await verificationService.addDocumentsToVerification(
                    message.verificationId,
                    message.documents
                );
                
                const verificationRequest = await verificationService.getVerificationById(message.verificationId);
                const verificationResult = await verificationService.verifyDocuments(
                    message.verificationId,
                    verificationRequest.documents
                );
                
                if (verificationResult.success) {
                    await verificationService.approveVerification(
                        message.verificationId,
                        'system',
                        'Document verification passed'
                    );
                } else if (verificationResult.requiresManualReview) {
                    await verificationService.queueForManualReview(message.verificationId);
                    await verificationService.notifyAdminAboutPendingVerification(verificationRequest);
                } else if (verificationResult.requiresAdditionalDocuments) {
                    const verificationProducer = require('./producer');
                    await verificationProducer.publishDocumentRequest(
                        message.verificationId,
                        message.entityId,
                        verificationResult.requiredDocumentTypes,
                        verificationResult.reason
                    );
                    await verificationService.updateVerificationStatus(
                        message.verificationId,
                        'additional_documents_required'
                    );
                } else {
                    await verificationService.rejectVerification(
                        message.verificationId,
                        'system',
                        verificationResult.reason || 'Document verification failed'
                    );
                }
            } catch (error) {
                logger.error(`Error processing document upload: ${error.message}`);
                throw error;
            }
        });
    }

    async consumeVerificationDecision() {
        const queue = config.queues.verification.decision;
        
        await this.consume(queue, async (message) => {
            try {
                logger.info(`Processing verification decision for ID: ${message.verificationId}`);
                
                if (message.status === 'approved') {
                    await verificationService.approveVerification(
                        message.verificationId,
                        message.reviewedBy,
                        message.comments
                    );
                } else if (message.status === 'rejected') {
                    await verificationService.rejectVerification(
                        message.verificationId,
                        message.reviewedBy,
                        message.comments
                    );
                } else {
                    logger.warn(`Unknown decision status: ${message.status}`);
                }
            } catch (error) {
                logger.error(`Error processing verification decision: ${error.message}`);
                throw error;
            }
        });
    }
}

module.exports = VerificationConsumer; 