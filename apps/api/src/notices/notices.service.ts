import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNoticeDto } from './dto/create-notice.dto';

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
}
