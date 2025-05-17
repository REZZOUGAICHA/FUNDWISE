import { Test, TestingModule } from '@nestjs/testing';
import { WalletManagementService } from './wallet-management.service';

describe('WalletManagementService', () => {
  let service: WalletManagementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WalletManagementService],
    }).compile();

    service = module.get<WalletManagementService>(WalletManagementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
