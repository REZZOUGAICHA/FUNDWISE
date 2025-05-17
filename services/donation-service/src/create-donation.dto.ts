


import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateDonationDto {
  @IsNotEmpty()
  @IsString()
  donor_id: string;

  @IsNotEmpty()
  @IsString()
  campaign_id: string;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsString()
  payment_method: string;

  @IsNotEmpty()
  @IsString()
  transaction_hash: string;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsString()
  encrypted_amount?: string;
}