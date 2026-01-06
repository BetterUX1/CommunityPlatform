import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { NoticesModule } from './notices/notices.module';
import { HealthModule } from './health/health.module';
import { DocumentsModule } from './documents/documents.module';
import { FilesModule } from './files/files.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    NoticesModule,
    HealthModule,
    DocumentsModule,
    FilesModule,
  ],
})
export class AppModule {}
