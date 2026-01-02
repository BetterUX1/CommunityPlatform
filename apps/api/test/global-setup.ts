import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function loadEnvFile(filePath: string) {
  const content = readFileSync(filePath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    let val = trimmed.slice(idx + 1).trim();
    val = val.replace(/^"/, '').replace(/"$/, '');
    process.env[key] = val;
  }
}

export default async function globalSetup() {
  const envPath = resolve(__dirname, '../.env.test');
  loadEnvFile(envPath);

  // Kör migrations mot test-DB/schema
  // Prisma 7: använd din prisma.config.ts / schema-lokalisering som du redan har.
  execSync('pnpm dlx prisma migrate deploy --schema ./prisma/schema.prisma', {
    cwd: resolve(__dirname, '..'),
    stdio: 'inherit',
    env: process.env,
  });
}
