import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';

async function sendTestDonation() {
  const client: ClientProxy = ClientProxyFactory.create({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://localhost:5672'],
      queue: 'donation.created',
      queueOptions: {
        durable: true,
      },
      exchange: 'donation_exchange',
      routingKey: 'donation.created',
    },
  });

  try {
    await client.connect();
    
    const testDonation = {
      event_type: 'donation.created',
      data: {
        campaign_id: 'test-campaign-123',
        donor_id: 'test-donor-456',
        amount: 100,
        transaction_id: 'test-transaction-789',
        currency: 'USD',
        payment_method: 'card'
      }
    };

    console.log('Sending test donation:', testDonation);
    await client.emit('donation.created', testDonation);
    console.log('Test donation sent successfully');
  } catch (error) {
    console.error('Error sending test donation:', error);
  } finally {
    await client.close();
  }
}

sendTestDonation(); 