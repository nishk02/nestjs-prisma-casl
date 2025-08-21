import path from 'node:path';
import { PrismaConfig } from 'prisma';
import 'dotenv/config';

export default {
  schema: path.join(__dirname, './prisma/schemas'),
  migrations: {
    seed: `ts-node --transpile-only prisma/seeds/seed.ts`,
  },
} satisfies PrismaConfig;
