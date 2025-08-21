import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Main function to seed the database with initial data.
 * It dynamically imports and executes all seed files in the seeds directory.
 */
async function main() {
  const seedFiles = [
    './role.seed',
    './permission.seed',
    './user.seed',
    // Add more seed files here as needed
  ];

  for (const [index, file] of seedFiles.entries()) {
    const mod = await import(file);
    if (typeof mod.seed === 'function') {
      await mod.seed(prisma, index + 1);
    }
  }
}

// Execute the main function to start seeding
main()
  .then(async () => {
    console.log('✅ Seeding completed successfully');
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
