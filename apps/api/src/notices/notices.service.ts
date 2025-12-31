import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { UpdateNoticeDto } from './dto/update-notice.dto';

@Injectable()
export class NoticesService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.notice.findMany({ orderBy: { createdAt: 'desc' } });
  }

  create(dto: CreateNoticeDto) {
    return this.prisma.notice.create({
      data: { title: dto.title, body: dto.body },
    });
  }

  update(id: number, dto: UpdateNoticeDto) {
    return this.prisma.notice.update({
      where: { id },
      data: { ...dto },
    });
  }

  delete(id: number) {
    return this.prisma.notice.delete({ where: { id } });
  }
}
