import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('API (e2e + db)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    // globalSetup har redan satt env + kört migrations
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    const prisma = app.get(PrismaService);

    await prisma.$disconnect?.();

    // await prisma.pool?.end?.();
    await app.close();
  });

  it('GET /health/ready -> 200', async () => {
    await request(app.getHttpServer()).get('/health/ready').expect(200);
  });

  it('POST then GET /notices returns created item', async () => {
    const created = await request(app.getHttpServer())
      .post('/notices')
      .send({ title: 'A2', body: 'db test' })
      .expect(201);

    const list = await request(app.getHttpServer()).get('/notices').expect(200);

    expect(Array.isArray(list.body)).toBe(true);
    expect(list.body.some((n: any) => n.id === created.body.id)).toBe(true);
  });
});
