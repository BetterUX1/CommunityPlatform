import { Injectable, Logger } from '@nestjs/common';
import { promises as fs } from 'node:fs';
import * as path from 'node:path';

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);

  // Same path as multer
  private readonly uploadDir = process.env.UPLOAD_DIR || '/data/uploads';

  async deleteFileIfExists(filename: string) {
    const filePath = path.join(this.uploadDir, filename);
    try {
      await fs.unlink(filePath);
      this.logger.log(`Deleted file: ${filePath}`);
    } catch (err: any) {
      if (err?.code === 'ENOENT') return; // redan borta -> ok
      this.logger.error(`Error deleting file: ${filePath}`, err?.stack || err);
      throw err;
    }
  }
}
