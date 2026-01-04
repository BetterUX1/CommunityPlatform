import { Module } from '@nestjs/common';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { FilesModule } from '../files/files.module';

@Module({
  controllers: [DocumentsController],
  providers: [DocumentsService],
  imports: [FilesModule],
})
export class DocumentsModule {}
