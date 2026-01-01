import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { NoticesModule } from './notices/notices.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [PrismaModule, NoticesModule, HealthModule],
})
export class AppModule {}
