import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('API (e2e)', () => {
  let app: INestApplication;

  // Minimal Prisma-mock för de metoder din code använder
  const prismaMock = {
    notice: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $queryRaw: jest.fn().mockResolvedValue(1), // return OK
  };

  beforeAll(async () => {
    prismaMock.notice.findMany.mockResolvedValue([
      { id: 1, title: 'Hej', body: 'Test' },
    ]);
    prismaMock.notice.create.mockImplementation(async ({ data }: any) => ({
      id: 2,
      ...data,
    }));
    prismaMock.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaMock)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /health/live -> 200', async () => {
    await request(app.getHttpServer()).get('/health/live').expect(200);
  });

  it('GET /health/ready -> 200', async () => {
    await request(app.getHttpServer()).get('/health/ready').expect(200);
  });

  it('GET /notices -> array', async () => {
    const res = await request(app.getHttpServer()).get('/notices').expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].title).toBe('Hej');
  });

  it('POST /notices -> creates', async () => {
    const res = await request(app.getHttpServer())
      .post('/notices')
      .send({ title: 'Ny', body: 'Text' })
      .expect(201);

    expect(res.body.title).toBe('Ny');
  });
});
