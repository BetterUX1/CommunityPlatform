import { Controller, Get, Param, Res, NotFoundException } from '@nestjs/common';
import type { Response } from 'express';
import { FilesService } from './files.service';

import * as fs from 'node:fs';
import * as path from 'node:path';

@Controller('files')
export class FilesController {
  @Get(':filename')
  getFile(@Param('filename') filename: string, @Res() res: Response) {
    const uploadDir = process.env.UPLOAD_DIR || '/data/uploads';
    const filePath = path.join(uploadDir, filename);

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('File not found');
    }

    return res.sendFile(filePath);
  }
}
