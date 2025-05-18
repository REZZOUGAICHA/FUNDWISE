// test/campaign.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { JwtAuthGuard } from '../src/auth/jwt-auth.guard';
import { RolesGuard } from '../src/auth/roles.guard';
import { PrismaService } from '../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { Prisma } from '@prisma/client';

describe('Campaign Service (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  
  beforeAll(async () => {
    // Create test module with mocked guards
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
    .overrideGuard(JwtAuthGuard)
    .useValue({
      canActivate: (context: { switchToHttp: () => { (): any; new(): any; getRequest: { (): any; new(): any; }; }; }) => {
        const request = context.switchToHttp().getRequest();
        // Set a mock user with role
        request.user = { id: 'test-user-id', role: 'organization' };
        return true;
      }
    })
    .overrideGuard(RolesGuard)
    .useValue({
      canActivate: () => true
    })
    .overrideProvider('VERIFICATION_SERVICE')
    .useValue({
      emit: jest.fn().mockImplementation(() => ({
        pipe: jest.fn(),
      })),
    })
    .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    
    // Get the PrismaService instance
    prisma = app.get<PrismaService>(PrismaService);
    
    // Mock the prisma service methods
    jest.spyOn(prisma.campaigns, 'findMany').mockResolvedValue([
      {
        id: '1',
        title: 'Test Campaign',
        description: 'Test Description',
        target_amount: new Prisma.Decimal(10000),
        current_amount: new Prisma.Decimal(5000),
        start_date: new Date(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        image_url: 'https://example.com/image.jpg',
        ipfs_hash: 'ipfs-hash',
        status: 'active',
        organization_id: 'org-id',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
    
    jest.spyOn(prisma.campaigns, 'findUnique').mockResolvedValue({
      id: '1',
      title: 'Test Campaign',
      description: 'Test Description',
      target_amount: new Prisma.Decimal(10000),
      current_amount: new Prisma.Decimal(5000),

      start_date: new Date(),
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      image_url: 'https://example.com/image.jpg',
      ipfs_hash: 'ipfs-hash',
      status: 'active',
      organization_id: 'org-id',
      created_at: new Date(),
      updated_at: new Date()
    });
    
    jest.spyOn(prisma, '$queryRaw').mockResolvedValue([
      { 
        id: 'org-id', 
        name: 'Test Organization',
        description: 'Test Org Description',
        logo_url: 'https://example.com/logo.jpg',
        website: 'https://example.com',
        verification_status: 'approved'
      }
    ]);
    
    jest.spyOn(prisma.proofs, 'findMany').mockResolvedValue([]);
  });
  
  afterAll(async () => {
    await app.close();
  });
  
  describe('GET /campaigns', () => {
    it('should return all campaigns', () => {
      return request(app.getHttpServer())
        .get('/campaigns')
        .expect(200)
        .expect(res => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
        });
    });
  });
  
  describe('GET /campaigns/:id', () => {
    it('should return a specific campaign', () => {
      return request(app.getHttpServer())
        .get('/campaigns/1')
        .expect(200)
        .expect(res => {
          expect(res.body.id).toBe('1');
          expect(res.body.title).toBe('Test Campaign');
        });
    });
    
    it('should return 404 for non-existent campaign', () => {
      // Mock findUnique to return null for this specific test
      jest.spyOn(prisma.campaigns, 'findUnique').mockResolvedValueOnce(null);
      
      return request(app.getHttpServer())
        .get('/campaigns/999')
        .expect(404);
    });
  });
  
  describe('Basic App Health', () => {
    it('/ (GET)', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect('FundWise Campaign Service is running!');
    });
  });
});
