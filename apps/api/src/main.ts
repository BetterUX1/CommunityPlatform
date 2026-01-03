//import 'dotenv/config'; - Not working in the container
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors(); // Allow calls from the web app
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = new DocumentBuilder()
    .setTitle('Community Platform API')
    .setDescription('API for managing notices and community interactions')
    .setVersion('0.1.0')
    .build();

  // static serve docs folder
  const uploadDir = process.env.UPLOAD_DIR ?? '/data/uploads';
  if (!existsSync(uploadDir)) {
    mkdirSync(uploadDir, { recursive: true });
  }

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // console.log('DATABASE_URL:', process.env.DATABASE_URL);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
