/**
 * Production migration runner — drizzle-kit is a devDependency and does not
 * ship in the image, so deploys run this instead:
 *
 *   docker compose run --rm app node dist/migrate.js
 *
 * Applies src/db/migrations (copied into the image) exactly once each, in
 * order, using drizzle's journal. Safe to re-run.
 */
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is required');
  const client = postgres(url, { max: 1 });
  await migrate(drizzle(client), { migrationsFolder: './migrations' });
  await client.end();
  console.log('migrations: up to date');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
