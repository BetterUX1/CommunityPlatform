import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { NoticesModule } from './notices/notices.module';

@Module({
  imports: [PrismaModule, NoticesModule],
})
export class AppModule {}
