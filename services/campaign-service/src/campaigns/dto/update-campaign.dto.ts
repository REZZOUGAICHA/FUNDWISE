// services/campaign-service/src/campaign/dto/update-campaign.dto.ts
import { IsOptional, IsString, IsNumber, IsDateString } from 'class-validator';

export class UpdateCampaignDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  target_amount?: number;

  @IsOptional()
  @IsDateString()
  end_date?: string;

  @IsOptional()
  @IsString()
  image_url?: string;

  @IsOptional()
  @IsString()
  image_data?: string; // Base64 encoded image
}
