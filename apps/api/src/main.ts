//import 'dotenv/config'; - Not working in the container
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // Allow calls from the web app
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = new DocumentBuilder()
    .setTitle('Community Platform API')
    .setDescription('API for managing notices and community interactions')
    .setVersion('0.1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // console.log('DATABASE_URL:', process.env.DATABASE_URL);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
