import { PrismaClient, UserRole } from '@prisma/client';

export async function seed(prisma: PrismaClient, step: number): Promise<void> {
  console.log(`\n${step}: Seeding Roles...`);
  const roles: UserRole[] = ['ADMIN', 'USER', 'GUEST'];
  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role },
      update: {},
      create: { name: role },
    });
  }
  console.log(roles.join(', ') + '\n');
  console.log(`☑️ Seeding Roles Completed\n`);
}
