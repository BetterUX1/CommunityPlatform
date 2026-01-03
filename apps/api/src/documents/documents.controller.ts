import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { randomUUID } from 'crypto';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly docs: DocumentsService) {}

  @Get()
  list() {
    return this.docs.list();
  }

  @Post()
  create(@Body() dto: CreateDocumentDto) {
    return this.docs.create(dto);
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: process.env.UPLOAD_DIR ?? '/data/uploads',
        filename: (_req, file, cb) => {
          const id = randomUUID();
          const ext = extname(file.originalname) || '';
          cb(null, `${id}${ext}`);
        },
      }),
      limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
    }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { title?: string; category?: string },
  ) {
    // URL som webben kan öppna via ingress: /api/files/...
    const url = `/api/files/${file.filename}`;
    return this.docs.createUploaded({
      title: body.title ?? file.originalname,
      category: body.category,
      url,
      filename: file.filename,
      mimeType: file.mimetype,
      size: file.size,
    });
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.docs.remove(id);
  }
}
