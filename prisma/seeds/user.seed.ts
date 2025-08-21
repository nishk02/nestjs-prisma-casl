import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

async function hashPassword(password: string): Promise<string> {
  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS ?? '12', 10);
  const pepper = process.env.BCRYPT_PASSWORD_PEPPER;
  if (!pepper) {
    throw new Error(
      'BCRYPT_PASSWORD_PEPPER is not defined in the environment variables',
    );
  }
  return await bcrypt.hash(password + pepper, saltRounds);
}

export async function seed(prisma: PrismaClient, step: number): Promise<void> {
  console.log(`\n${step}: Seeding Users...\n`);
  if (!process.env.ADMIN_EMAIL) {
    throw new Error('ADMIN_EMAIL is not set in the environment variables');
  }
  if (!process.env.ADMIN_USERNAME) {
    throw new Error('ADMIN_USERNAME is not set in the environment variables');
  }
  if (!process.env.ADMIN_PASSWORD) {
    throw new Error('ADMIN_PASSWORD is not set in the environment variables');
  }

  const admin = await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL,
      username: process.env.ADMIN_USERNAME,
      password: await hashPassword(process.env.ADMIN_PASSWORD),
      userRoles: {
        create: { role: { connect: { name: 'ADMIN' } } },
      },
    },
    select: {
      id: true,
      uuid: true,
      email: true,
      username: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'johndoe@example.com' },
    update: {},
    create: {
      email: 'johndoe@example.com',
      username: 'johndoe',
      password: await hashPassword('John@123'),
      userRoles: {
        create: { role: { connect: { name: 'USER' } } },
      },
    },
    select: {
      id: true,
      uuid: true,
      email: true,
      username: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  console.log(`Role "Admin":`);
  console.log(admin, '\n');

  console.log(`Role "User":`);
  console.log(user, '\n');
  console.log('☑️ Seeding Users Completed\n');
}
