// src/campaigns/dto/create-campaign.dto.ts
import { IsNotEmpty, IsString, IsNumber, IsOptional, IsDateString, IsUUID } from 'class-validator';

export class CreateCampaignDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsNumber()
  target_amount: number;

  @IsNotEmpty()
  @IsDateString()
  start_date: string;

  @IsNotEmpty()
  @IsDateString()
  end_date: string;

  @IsOptional()
  @IsString()
  image_url?: string;

  @IsOptional()
  @IsString()
  image_data?: string; // Base64 encoded image

  @IsNotEmpty()
  @IsUUID()
  organization_id: string;
}
