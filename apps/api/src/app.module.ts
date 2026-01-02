import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { NoticesModule } from './notices/notices.module';
import { HealthModule } from './health/health.module';
import { DocumentsModule } from './documents/documents.module';

@Module({
  imports: [PrismaModule, NoticesModule, HealthModule, DocumentsModule],
})
export class AppModule {}
