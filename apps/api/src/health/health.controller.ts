import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('live')
  live() {
    return { ok: true };
  }

  @Get('ready')
  async ready() {
    // Snabb DB-ping. Prisma kör en trivial query.
    await this.prisma.$queryRaw`SELECT 1`;
    return { ok: true };
  }
}
