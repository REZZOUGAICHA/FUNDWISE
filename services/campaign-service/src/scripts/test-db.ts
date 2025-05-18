import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  try {
    // Test query for donation service
    const donorTransCount = await prisma.donor_transactions.count();
    console.log(`Donation service DB connection successful. Found ${donorTransCount} donor transaction records.`);
    
    const transDetailsCount = await prisma.transaction_details.count();
    console.log(`Found ${transDetailsCount} transaction detail records.`);
    
    const publicStatsCount = await prisma.public_donation_stats.count();
    console.log(`Found ${publicStatsCount} public donation statistic records.`);
  } catch (error) {
    console.error('Error connecting to database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
