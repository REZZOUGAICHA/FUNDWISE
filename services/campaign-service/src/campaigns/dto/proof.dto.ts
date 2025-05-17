// services/campaign-service/src/campaign/dto/proof.dto.ts
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class ProofDto {
  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsNumber()
  amount_used: number;

  @IsOptional()
  @IsString()
  document_data?: string; // Base64 encoded document
}
