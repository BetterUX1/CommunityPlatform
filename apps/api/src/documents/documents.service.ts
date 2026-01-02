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
      },
    });
  }

  remove(id: number) {
    return this.prisma.document.delete({ where: { id } });
  }
}
