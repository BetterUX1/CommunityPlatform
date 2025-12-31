import { Module } from '@nestjs/common';
import { NoticesModule } from './notices/notices.module';

@Module({
  imports: [NoticesModule],
})
export class AppModule {}
