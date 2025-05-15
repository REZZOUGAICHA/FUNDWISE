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
  } catch (error) {
    console.error('Error connecting to database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
