import fs from 'node:fs';
import path from 'node:path';
import postgres from 'postgres';

const rootDir = process.cwd();
const envPath = path.join(rootDir, '.env');

if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');

  for (const line of envFile.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const equalIndex = trimmed.indexOf('=');
    if (equalIndex === -1) continue;

    const key = trimmed.slice(0, equalIndex).trim();
    let value = trimmed.slice(equalIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] ??= value;
  }
}

const databaseUrl = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('Missing POSTGRES_URL or DATABASE_URL.');
  process.exit(1);
}

const migrationFiles = fs
  .readdirSync(path.join(rootDir, 'migrations'))
  .filter((file) => file.endsWith('.sql'))
  .sort();

const connectionUrl = databaseUrl.includes('?')
  ? `${databaseUrl}&sslmode=require`
  : `${databaseUrl}?sslmode=require`;

const sql = postgres(connectionUrl, {
  max: 1,
  onnotice: () => {},
});

try {
  for (const file of migrationFiles) {
    const fullPath = path.join(rootDir, 'migrations', file);
    const migrationSql = fs.readFileSync(fullPath, 'utf8');

    console.log(`Running ${file}`);
    await sql.begin(async (tx) => {
      await tx.unsafe(migrationSql);
    });
    console.log(`Finished ${file}`);
  }
} catch (error) {
  console.error('Migration failed.');
  console.error(error);
  process.exitCode = 1;
} finally {
  await sql.end();
}
