export interface DonationEvent {
  event_type: 'donation.created' | 'donation.processed';
  data: {
    campaign_id: string;
    donor_id: string;
    amount: number;
    transaction_id: string;
    currency: string;
    payment_method: string;
    donation_id?: string;
    metadata?: Record<string, any>;
  };
}

export interface DonationResponse {
  success: boolean;
  message: string;
  donation_id?: string;
  error?: string;
} 