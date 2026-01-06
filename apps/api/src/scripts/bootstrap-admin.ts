import { NestFactory } from '@nestjs/core';
import * as argon2 from 'argon2';
import { AppModule } from '../app.module';
import { PrismaService } from '../prisma/prisma.service';

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  const prisma = app.get(PrismaService);

  const email = process.env.BOOTSTRAP_ADMIN_EMAIL ?? 'admin@local';
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD ?? 'admin123';
  const passwordHash = await argon2.hash(password);

  // OBS: anpassa om din modell heter annorlunda (t.ex. passwordHash, roles-rel etc)
  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash },
    create: {
      email,
      passwordHash,
      roles: { create: [{ role: 'ADMIN' }] }, // eller Role.ADMIN om du vill importera enum
    },
    include: { roles: true },
  });

  console.log(
    `Bootstrapped user: ${user.email} roles=${user.roles.map((r) => r.role).join(',')}`,
  );

  await app.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
