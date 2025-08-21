import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super();
  }

  public async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  get client() {
    return this.$extends(withAccelerate());
  }
}
