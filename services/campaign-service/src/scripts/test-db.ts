import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  try {
    // Test query for campaign service
    const campaignCount = await prisma.campaigns.count();
    console.log(`Campaign service DB connection successful. Found ${campaignCount} campaigns.`);
    
    const proofsCount = await prisma.proofs.count();
    console.log(`Found ${proofsCount} proofs of fund usage.`);
  } catch (error) {
    console.error('Error connecting to database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
