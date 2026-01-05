import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { FilesService } from '../files/files.service';

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly filesService: FilesService,
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

  /**
   *
   * Soft delete a document and remove associated file if exists
   *
   * @param id
   * @returns
   */

  async removeDocument(id: number) {
    const doc = await this.prisma.document.findUnique({ where: { id } });
    if (!doc || doc.deletedAt) {
      throw new NotFoundException(`Document with id ${id} not found`);
    }

    if (doc.filename) {
      await this.filesService.deleteFileIfExists(doc.filename);
    }

    // Soft delete in case of issues with file deletion
    return this.prisma.document.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Cleanup documents that were soft deleted older than specified days
   *
   * @param olderThanDays
   * @returns
   */
  async cleanupDeletedDocuments(olderThanDays: number) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - olderThanDays);

    const docs = await this.prisma.document.findMany({
      where: {
        deletedAt: {
          not: null,
          lt: cutoff,
        },
      },
    });

    for (const doc of docs) {
      if (doc.filename) {
        await this.filesService.deleteFileIfExists(doc.filename);
      }

      await this.prisma.document.delete({
        where: { id: doc.id },
      });
    }

    this.logger.log(`Cleaned up ${docs.length} documents`);

    return { deleted: docs.length };
  }
}
