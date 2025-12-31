import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error(
        'DATABASE_URL is missing. Check apps/api/.env and dotenv/config import.',
      );
    }

    const pool = new Pool({ connectionString: url });
    super({ adapter: new PrismaPg(pool) });
  }
}
