import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();

  try {
    // Count profiles
    const profileCount = await prisma.profiles.count();
    console.log(`Auth service DB connection successful. Found ${profileCount} profiles.`);

    // Count organizations
    const orgCount = await prisma.organizations.count();
    console.log(`Found ${orgCount} organizations.`);

    // Fetch and display users
    const users = await prisma.user.findMany();
    console.log(`Auth schema DB connection successful. Found ${users.length} users.`);
    
    users.forEach(User => {
      console.log(`User: ${User.id}, ${User.email}`); // Adjust fields based on your schema
    });

  } catch (error) {
    console.error('Error connecting to database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
