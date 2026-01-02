import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Documents (e2e + db)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST then GET /documents', async () => {
    const created = await request(app.getHttpServer())
      .post('/documents')
      .send({
        title: 'Protokoll',
        url: 'https://example.com/protokoll.pdf',
        category: 'Protokoll',
      })
      .expect(201);

    const list = await request(app.getHttpServer())
      .get('/documents')
      .expect(200);

    expect(list.body.some((d: any) => d.id === created.body.id)).toBe(true);
  });
});
