import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { BrokerService } from './broker.service';

@Injectable()
export class DonationConsumerService implements OnModuleInit {
  private readonly logger = new Logger(DonationConsumerService.name);

  constructor(private readonly brokerService: BrokerService) {}

  async onModuleInit() {
    await this.startConsuming();
  }

  async startConsuming() {
    this.logger.log('Starting to consume donation messages...');
    
    try {
      await this.brokerService.consume(async (message) => {
        this.logger.log('Received donation message:');
        this.logger.log(JSON.stringify(message, null, 2));
        
        // Vous pouvez ici traiter le message selon vos besoins
        // Par exemple, mettre à jour la base de données, envoyer des notifications, etc.
        
        this.logger.log(`Processed donation with transaction ID: ${message.transaction_id}`);
      });
      
      this.logger.log('Consumer registered successfully');
    } catch (error) {
      this.logger.error(`Failed to start consumer: ${error.message}`, error.stack);
    }
  }
}