import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // Allow calls from the web app
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // console.log('DATABASE_URL:', process.env.DATABASE_URL);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
