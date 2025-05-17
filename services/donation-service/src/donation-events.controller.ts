import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';

interface DonationEvent {
  transaction_id: string;
  donor_id: string;
  campaign_id: string;
  amount: number;
  payment_method: string;
  status: string;
  transaction_hash: string;
  message?: string;
  encrypted_amount: string;
  timestamp: Date;
}

@Controller()
export class DonationEventsController {
  private readonly logger = new Logger(DonationEventsController.name);

  @MessagePattern({ cmd: 'donation.created' })
  async handleDonationCreated(
    @Payload() data: DonationEvent,
    @Ctx() context: RmqContext
  ) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    const pattern = context.getPattern();

    try {
      this.logger.log(`Received event pattern: ${JSON.stringify(pattern)}`);
      this.logger.log(`Processing donation event for transaction: ${data.transaction_id}`);
      this.logger.debug('Event data:', data);
      
      // Here you can add your event handling logic
      // For example, update status, send notifications, etc.
      
      // Log successful processing
      this.logger.log(`Successfully processed donation event for transaction: ${data.transaction_id}`);
      
      // Acknowledge the message
      channel.ack(originalMsg);
    } catch (error) {
      this.logger.error(`Error processing donation event: ${error.message}`, error.stack);
      
      // Negative acknowledge the message and requeue
      channel.nack(originalMsg, false, true);
      throw error;
    }
  }

  @MessagePattern({ cmd: '*' })
  async catchAll(
    @Payload() data: any,
    @Ctx() context: RmqContext
  ) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    const pattern = context.getPattern();

    this.logger.debug(`Received unhandled message with pattern: ${JSON.stringify(pattern)}`);
    this.logger.debug('Message data:', data);
    
    // Acknowledge the message to prevent it from being requeued
    channel.ack(originalMsg);
  }
}