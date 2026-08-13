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
import { and, eq, isNotNull, lt } from 'drizzle-orm';
import { db } from '@/db';
import { verification } from '@/db/schema';
import { deleteStoredObject } from '@/lib/storage';
import { audit } from '@/lib/privacy';

/** C-07: reviewed documents are deleted 90 days after review. The promise is
 *  stated to the member before upload — this job is what keeps it. */
async function purgeDocuments() {
  const due = await db.select().from(verification).where(
    and(isNotNull(verification.purgeAfter), lt(verification.purgeAfter, new Date()),
        isNotNull(verification.docKey)),
  );
  for (const row of due) {
    if (row.docKey) await deleteStoredObject(row.docKey);
    if (row.selfieKey) await deleteStoredObject(row.selfieKey);
    await db.update(verification)
      .set({ docKey: null, selfieKey: null })
      .where(eq(verification.id, row.id));
    await audit(null, 'verification_documents_purged', 'verification', row.id);
  }
  if (due.length) console.log(`purge-documents: ${due.length} verification(s) purged`);
}

async function main() {
  const boss = new PgBoss({
    connectionString: process.env.DATABASE_URL,
    schema: 'pgboss',
  });
  boss.on('error', (err) => console.error('pg-boss:', err));
  await boss.start();

  await boss.createQueue('purge-documents');
  await boss.schedule('purge-documents', '30 3 * * *', undefined, { tz: 'Asia/Kuala_Lumpur' });
  await boss.work('purge-documents', purgeDocuments);

  console.log('worker: pg-boss started; jobs: purge-documents (daily 03:30)');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
