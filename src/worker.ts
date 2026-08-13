/**
 * The VPS job runner — same image as the app, different command (see
 * docker-compose.yml). pg-boss lives inside Postgres; there is no Redis.
 * The job logic itself is host-agnostic in src/lib/jobs.ts — serverless
 * deployments fire the same functions from /api/jobs/run instead.
 */
import PgBoss from 'pg-boss';
import {
  purgeDocuments, expireRequests, sendReminders, spawnRecurring, widenVisibility,
} from '@/lib/jobs';

async function main() {
  const boss = new PgBoss({
    connectionString: process.env.DATABASE_URL,
    schema: 'pgboss',
  });
  boss.on('error', (err) => console.error('pg-boss:', err));
  await boss.start();

  const jobs: Array<[string, string, () => Promise<number>, object?]> = [
    ['purge-documents', '30 3 * * *', purgeDocuments, { tz: 'Asia/Kuala_Lumpur' }],
    ['request-expiry', '*/10 * * * *', expireRequests],
    ['reminders', '*/10 * * * *', sendReminders],
    ['recurring-spawn', '0 6 * * *', spawnRecurring, { tz: 'Asia/Kuala_Lumpur' }],
    ['widen-visibility', '*/10 * * * *', widenVisibility],
  ];
  for (const [name, cron, fn, opts] of jobs) {
    await boss.createQueue(name);
    await boss.schedule(name, cron, undefined, opts);
    await boss.work(name, async () => {
      const n = await fn();
      if (n) console.log(`${name}: ${n} processed`);
    });
  }

  console.log(`worker: ${jobs.length} jobs scheduled`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
