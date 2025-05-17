// services/campaign-service/src/test/campaign.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';

describe('Campaign Service (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let prisma: PrismaService;
  
  // Test data
  const organizationId = uuidv4();
  const userId = uuidv4();
  const campaignId = uuidv4();
  let authToken: string;
  
  beforeAll(async () => {
    // Create test module
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    
    // Get services
    jwtService = app.get<JwtService>(JwtService);
    prisma = app.get<PrismaService>(PrismaService);
    
    // Create JWT token for testing
    authToken = jwtService.sign({
      id: userId,
      role: 'organization',
    });
    
    // Set up test data
    await setupTestData();
  });
  
  afterAll(async () => {
    // Clean up test data
    await cleanupTestData();
    await app.close();
  });
  
  async function setupTestData() {
    // Create test organization
    await prisma.$executeRaw`
      INSERT INTO auth_service.organizations (
        id, name, description, logo_url, website, owner_id, verification_status, wallet_address, created_at, updated_at
      ) VALUES (
        ${organizationId},
        'Test Organization',
        'Test Description',
        'https://example.com/logo.png',
        'https://example.com',
        ${userId},
        'approved',
        '0x1234567890abcdef1234567890abcdef12345678',
        NOW(),
        NOW()
      )
    `;
    
    // Create test campaign
    await prisma.$executeRaw`
      INSERT INTO campaign_service.campaigns (
        id, title, description, target_amount, current_amount, start_date, end_date, 
        image_url, status, organization_id, created_at, updated_at
      ) VALUES (
        ${campaignId},
        'Test Campaign',
        'Test Campaign Description',
        10000,
        5000,
        NOW(),
        NOW() + INTERVAL '30 days',
        'https://example.com/campaign.jpg',
        'active',
        ${organizationId},
        NOW(),
        NOW()
      )
    `;
  }
  
  async function cleanupTestData() {
    // Delete test data in reverse order to avoid foreign key constraints
    await prisma.$executeRaw`DELETE FROM campaign_service.proofs WHERE campaign_id = ${campaignId}`;
    await prisma.$executeRaw`DELETE FROM verification_service.fund_release_requests WHERE campaign_id = ${campaignId}`;
    await prisma.$executeRaw`DELETE FROM verification_service.verifications WHERE entity_id = ${campaignId}`;
    await prisma.$executeRaw`DELETE FROM campaign_service.campaigns WHERE id = ${campaignId}`;
    await prisma.$executeRaw`DELETE FROM auth_service.organizations WHERE id = ${organizationId}`;
  }
  
  describe('GET /campaigns', () => {
    it('should return all campaigns', () => {
      return request(app.getHttpServer())
        .get('/campaigns')
        .expect(200)
        .expect(res => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body.some((campaign: { id: string; }) => campaign.id === campaignId)).toBe(true);
        });
    });
    
    it('should filter campaigns by status', () => {
      return request(app.getHttpServer())
        .get('/campaigns?status=active')
        .expect(200)
        .expect(res => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.every((campaign: { status: string; }) => campaign.status === 'active')).toBe(true);
        });
    });
    
    it('should filter campaigns by organization', () => {
      return request(app.getHttpServer())
        .get(`/campaigns?organizationId=${organizationId}`)
        .expect(200)
        .expect(res => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.every((campaign: { organization_id: string; }) => campaign.organization_id === organizationId)).toBe(true);
        });
    });
  });
  
  describe('GET /campaigns/:id', () => {
    it('should return a specific campaign', () => {
      return request(app.getHttpServer())
        .get(`/campaigns/${campaignId}`)
        .expect(200)
        .expect(res => {
          expect(res.body.id).toBe(campaignId);
          expect(res.body.title).toBe('Test Campaign');
          expect(res.body.organization).toBeDefined();
          expect(res.body.proofs).toBeDefined();
        });
    });
    
    it('should return 404 for non-existent campaign', () => {
      const nonExistentId = uuidv4();
      return request(app.getHttpServer())
        .get(`/campaigns/${nonExistentId}`)
        .expect(404);
    });
  });
  
  describe('POST /campaigns', () => {
    it('should create a new campaign', () => {
      const newCampaign = {
        title: 'New Test Campaign',
        description: 'New Test Campaign Description',
        target_amount: 15000,
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        image_url: 'https://example.com/new-campaign.jpg',
        organization_id: organizationId
      };
      
      return request(app.getHttpServer())
        .post('/campaigns')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newCampaign)
        .expect(201)
        .expect(res => {
          expect(res.body.title).toBe(newCampaign.title);
          expect(res.body.description).toBe(newCampaign.description);
          expect(res.body.target_amount).toBe(newCampaign.target_amount);
          expect(res.body.organization_id).toBe(organizationId);
          expect(res.body.status).toBe('pending');
          
          // Clean up the created campaign
          prisma.campaigns.delete({
            where: { id: res.body.id }
          }).catch(e => console.error('Failed to delete test campaign:', e));
        });
    });
    
    it('should return 403 when creating campaign for unauthorized organization', () => {
      const unauthorizedOrgId = uuidv4();
      
      const newCampaign = {
        title: 'Unauthorized Campaign',
        description: 'This should fail',
        target_amount: 5000,
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        organization_id: unauthorizedOrgId
      };
      
      return request(app.getHttpServer())
        .post('/campaigns')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newCampaign)
        .expect(403);
    });
  });
  
  describe('PUT /campaigns/:id', () => {
    it('should update an existing campaign', () => {
      const updateData = {
        title: 'Updated Campaign Title',
        description: 'Updated Campaign Description'
      };
      
      return request(app.getHttpServer())
        .put(`/campaigns/${campaignId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200)
        .expect(res => {
          expect(res.body.id).toBe(campaignId);
          expect(res.body.title).toBe(updateData.title);
          expect(res.body.description).toBe(updateData.description);
        });
    });
    
    it('should return 404 when updating non-existent campaign', () => {
      const nonExistentId = uuidv4();
      
      return request(app.getHttpServer())
        .put(`/campaigns/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Updated Title' })
        .expect(404);
    });
  });
  
  describe('GET /campaigns/organization/:organizationId', () => {
    it('should return all campaigns for an organization', () => {
      return request(app.getHttpServer())
        .get(`/campaigns/organization/${organizationId}`)
        .expect(200)
        .expect(res => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body.every((campaign: { organization_id: string; }) => campaign.organization_id === organizationId)).toBe(true);
        });
    });
  });
  
  describe('POST /campaigns/:id/submit-for-verification', () => {
    it('should submit a campaign for verification', () => {
      return request(app.getHttpServer())
        .post(`/campaigns/${campaignId}/submit-for-verification`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect(res => {
          expect(res.body.id).toBe(campaignId);
          expect(res.body.status).toBe('pending');
        });
    });
  });
  
  describe('POST /campaigns/:id/proof', () => {
    it('should add a proof to a campaign', () => {
      const proofData = {
        description: 'Test Proof',
        amount_used: 1000
      };
      
      return request(app.getHttpServer())
        .post(`/campaigns/${campaignId}/proof`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(proofData)
        .expect(201)
        .expect(res => {
          expect(res.body.campaign_id).toBe(campaignId);
          expect(res.body.description).toBe(proofData.description);
          expect(res.body.amount_used).toBe(proofData.amount_used);
          expect(res.body.status).toBe('pending');
        });
    });
  });
  
  describe('GET /campaigns/:id/proofs', () => {
    it('should get all proofs for a campaign', () => {
      return request(app.getHttpServer())
        .get(`/campaigns/${campaignId}/proofs`)
        .expect(200)
        .expect(res => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });
  
  describe('POST /campaigns/:id/fund-release', () => {
    it('should request fund release for a campaign', () => {
      const fundReleaseData = {
        amount: 1000,
        purpose: 'Test fund release'
      };
      
      return request(app.getHttpServer())
        .post(`/campaigns/${campaignId}/fund-release`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(fundReleaseData)
        .expect(201)
        .expect(res => {
          expect(res.body.campaign_id).toBe(campaignId);
          expect(res.body.amount).toBe(fundReleaseData.amount);
          expect(res.body.purpose).toBe(fundReleaseData.purpose);
          expect(res.body.status).toBe('pending');
        });
    });
    
    it('should return 403 when requesting more funds than available', () => {
      const excessiveAmount = {
        amount: 10000000, // Much more than available
        purpose: 'This should fail'
      };
      
      return request(app.getHttpServer())
        .post(`/campaigns/${campaignId}/fund-release`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(excessiveAmount)
        .expect(403);
    });
  });
  
  describe('DELETE /campaigns/:id', () => {
    it('should delete a campaign', async () => {
      // Create a temporary campaign to delete
      const tempCampaign = await prisma.campaigns.create({
        data: {
          title: 'Temporary Campaign',
          description: 'To be deleted',
          target_amount: 1000,
          current_amount: 0,
          start_date: new Date(),
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status: 'pending',
          organization_id: organizationId
        }
      });
      
      return request(app.getHttpServer())
        .delete(`/campaigns/${tempCampaign.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
    
    it('should return 404 when deleting non-existent campaign', () => {
      const nonExistentId = uuidv4();
      
      return request(app.getHttpServer())
        .delete(`/campaigns/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});
