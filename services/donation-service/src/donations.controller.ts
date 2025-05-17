import { Controller, Post, Body, HttpCode, HttpStatus, ValidationPipe } from '@nestjs/common';
import { DonationsService } from './donations.service';
import { CreateDonationDto } from './create-donation.dto';

@Controller('donations')
export class DonationsController {
  constructor(private readonly donationsService: DonationsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body(ValidationPipe) createDonationDto: CreateDonationDto) {
    return this.donationsService.createDonation(createDonationDto);
  }
}