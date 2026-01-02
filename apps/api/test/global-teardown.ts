import { Client } from 'pg';
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

export default async function globalTeardown() {
  const envPath = resolve(__dirname, '../.env.test');
  loadEnvFile(envPath);

  const url = process.env.DATABASE_URL!;
  const client = new Client({ connectionString: url });
  await client.connect();

  // droppa schema så nästa körning startar rent
  await client.query('DROP SCHEMA IF EXISTS e2e CASCADE; CREATE SCHEMA e2e;');

  await client.end();
}
