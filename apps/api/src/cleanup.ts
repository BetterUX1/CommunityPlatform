import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentsService } from './documents/documents.service';

async function main() {
  const days = Number(process.env.CLEANUP_DAYS ?? '30');
  if (Number.isNaN(days) || days < 0) {
    throw new Error(`Invalid CLEANUP_DAYS: ${process.env.CLEANUP_DAYS}`);
  }

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['log', 'error', 'warn'],
  });

  try {
    const documentsService = app.get(DocumentsService);
    const res = await documentsService.cleanupDeletedDocuments(days);
    console.log(`Cleanup done:`, res);
  } finally {
    await app.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
