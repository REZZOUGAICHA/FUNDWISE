import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  try {
    // Test query for verification service
    const verificationCount = await prisma.verifications.count();
    console.log(`Verification service DB connection successful. Found ${verificationCount} verification requests.`);
    
    // Get count by status
    const pendingCount = await prisma.verifications.count({
      where: { status: 'pending' }
    });
    console.log(`Found ${pendingCount} pending verification requests.`);
    
    // Test cross-schema access - get organizations
    const organizations = await prisma.$queryRaw`
      SELECT id, name, verification_status 
      FROM auth_service.organizations 
      LIMIT 5
    `;
    console.log(`Successfully accessed organizations:`, organizations);
    
    // Test cross-schema access - get campaigns
    const campaigns = await prisma.$queryRaw`
      SELECT id, title, status 
      FROM campaign_service.campaigns 
      LIMIT 5
    `;
    console.log(`Successfully accessed campaigns:`, campaigns);
    
    // Test cross-schema access - get proofs
    const proofs = await prisma.$queryRaw`
      SELECT id, campaign_id, status 
      FROM campaign_service.proofs 
      LIMIT 5
    `;
    console.log(`Successfully accessed proofs:`, proofs);
    
    // Test the helper function
    const entityDetails = await prisma.$queryRaw`
      SELECT verification_service.get_entity_details('organization', (
        SELECT id FROM auth_service.organizations LIMIT 1
      ))
    `;
    console.log(`Entity details function result:`, entityDetails);
    
  } catch (error) {
    console.error('Error connecting to database or accessing cross-schema data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
