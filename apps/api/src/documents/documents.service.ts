import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDocumentDto } from './dto/create-document.dto';

@Injectable()
export class DocumentsService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.document.findMany({ orderBy: { createdAt: 'desc' } });
  }

  create(dto: CreateDocumentDto) {
    return this.prisma.document.create({
      data: {
        title: dto.title,
        url: dto.url,
        category: dto.category?.trim() || null,
        filename: null,
        mimeType: null,
        size: null,
      },
    });
  }

  createUploaded(dto: {
    title: string;
    category?: string;
    url: string;
    filename: string;
    mimeType: string;
    size: number;
  }) {
    return this.prisma.document.create({
      data: {
        title: dto.title,
        category: dto.category?.trim() || null,
        url: dto.url,
        filename: dto.filename,
        mimeType: dto.mimeType,
        size: dto.size,
      },
    });
  }

  remove(id: number) {
    return this.prisma.document.delete({ where: { id } });
  }
}
