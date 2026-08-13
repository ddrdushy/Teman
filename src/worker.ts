/**
 * The job runner — same image as the app, different command (see
 * docker-compose.yml). pg-boss lives inside Postgres; there is no Redis.
 *
 * Jobs land here as their modules are built:
 *  - request expiry notice, sent BEFORE the date (docs/06_APP_FLOWS.md §13)
 *  - verification document purge, 90 days after review (C-07)
 *  - session reminders at 24 h and 2 h (G-05)
 *  - "requests now open" broadcast — the promise made during recruitment
 */
import PgBoss from 'pg-boss';

async function main() {
  const boss = new PgBoss({
    connectionString: process.env.DATABASE_URL,
    schema: 'pgboss',
  });
  boss.on('error', (err) => console.error('pg-boss:', err));
  await boss.start();
  console.log('worker: pg-boss started, no jobs registered yet');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
