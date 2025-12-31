import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { NoticesService } from './notices.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('notices')
@Controller('notices')
export class NoticesController {
  constructor(private readonly notices: NoticesService) {}

  @Get()
  list() {
    return this.notices.list();
  }

  @Post()
  create(@Body() dto: CreateNoticeDto) {
    return this.notices.create(dto);
  }
}
