// src/campaigns/dto/fund-release.dto.ts
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class FundReleaseDto {
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsString()
  purpose: string;
}
