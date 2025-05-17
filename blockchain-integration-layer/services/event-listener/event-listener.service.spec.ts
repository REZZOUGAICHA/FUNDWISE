import { Test, TestingModule } from '@nestjs/testing';
import { EventListenerService } from './event-listener.service';

describe('EventListenerService', () => {
  let service: EventListenerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EventListenerService],
    }).compile();

    service = module.get<EventListenerService>(EventListenerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
