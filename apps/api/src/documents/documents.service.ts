import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { FilesService } from '../files/files.service';

@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fileService: FilesService,
  ) {}

  list() {
    return this.prisma.document.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
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

  // Remove document with file deletion
  async removeDocument(id: number) {
    const doc = await this.prisma.document.findUnique({ where: { id } });
    if (!doc || doc.deletedAt) {
      throw new Error(`Document with id ${id} not found`);
    }

    if (doc.filename) {
      await this.fileService.deleteFileIfExists(doc.filename);
    }

    // Soft delete in case of issues with file deletion
    return this.prisma.document.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
