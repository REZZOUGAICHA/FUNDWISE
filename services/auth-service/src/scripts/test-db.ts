import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  try {
    // Test query for auth service
    const profileCount = await prisma.profiles.count();
    console.log(`Auth service DB connection successful. Found ${profileCount} profiles.`);
    
    const orgCount = await prisma.organizations.count();
    console.log(`Found ${orgCount} organizations.`);
  } catch (error) {
    console.error('Error connecting to database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
