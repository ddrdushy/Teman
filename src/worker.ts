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
import { and, eq, gt, isNotNull, lt, sql } from 'drizzle-orm';
import { db } from '@/db';
import { verification, request, match, notification, recurring, session } from '@/db/schema';
import { person as personTable } from '@/db/schema';
import { deleteStoredObject } from '@/lib/storage';
import { audit } from '@/lib/privacy';
import { notify } from '@/lib/notify';

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

/** D-19: the honest notice, sent BEFORE the date — "no one could make
 *  Friday" arrives Thursday evening, never Friday morning. */
async function expireRequests() {
  const due = await db.select().from(request).where(
    and(eq(request.status, 'looking'), lt(request.expiresAt, new Date())),
  );
  for (const r of due) {
    await db.update(request).set({ status: 'expired', updatedAt: new Date() })
      .where(eq(request.id, r.id));
    await notify(r.requesterId, 'requestExpired', { title: r.title });
  }
  if (due.length) console.log(`request-expiry: ${due.length} expired with honest notice`);
}

/** G-05: reminders at 24h and 2h, both parties, exactly once. */
async function sendReminders() {
  for (const [kind, hours] of [['reminder24h', 24], ['reminder2h', 2]] as const) {
    const windowStart = new Date(Date.now() + (hours - 0.5) * 3600_000);
    const windowEnd = new Date(Date.now() + hours * 3600_000);
    const rows = await db.select({
      requestId: request.id, title: request.title,
      requesterId: request.requesterId, temanId: match.temanId,
    }).from(request)
      .innerJoin(match, eq(match.requestId, request.id))
      .where(and(eq(request.status, 'matched'),
        gt(request.startsAt, windowStart), lt(request.startsAt, windowEnd)));
    for (const r of rows) {
      const already = await db.select({ n: sql<number>`count(*)::int` }).from(notification)
        .where(and(eq(notification.kind, kind),
          sql`${notification.params}->>'requestId' = ${r.requestId}`));
      if (already[0].n > 0) continue;
      await notify(r.requesterId, kind, { requestId: r.requestId, title: r.title });
      await notify(r.temanId, kind, { requestId: r.requestId, title: r.title });
    }
  }
}

/** J-02/K3 · Each active recurring occurrence auto-creates a pre-matched
 *  request ~3 days ahead. Advancing nextDate in the same pass is the
 *  double-spawn guard. */
async function spawnRecurring() {
  const FREQ_DAYS: Record<string, number> = { weekly: 7, fortnightly: 14, monthly: 28 };
  const due = await db.select().from(recurring).where(and(
    eq(recurring.state, 'active'),
    isNotNull(recurring.nextDate),
    lt(recurring.nextDate, new Date(Date.now() + 72 * 3600_000)),
  ));
  for (const rec of due) {
    const startsAt = new Date(rec.nextDate!);
    const [hh, mm] = rec.timeOfDay.split(':').map(Number);
    startsAt.setHours(hh, mm, 0, 0);
    if (startsAt.getTime() > Date.now()) {
      const requester = await db.query.person.findFirst({ where: eq(personTable.id, rec.requesterId) });
      if (requester?.approxPoint) {
        const [req] = await db.insert(request).values({
          requesterId: rec.requesterId,
          beneficiaryType: rec.forRecipientId ? 'care_recipient' : 'self',
          beneficiaryId: rec.forRecipientId,
          categoryId: rec.categoryId,
          status: 'matched',
          urgency: 'planned',
          title: rec.title,
          areaId: requester.areaId,
          approxPoint: requester.approxPoint,
          startsAt,
          endsAt: new Date(startsAt.getTime() + 2 * 3600_000),
          expiresAt: startsAt,
          visibility: 'trusted_only',
        }).returning({ id: request.id });
        const [m] = await db.insert(match).values({
          requestId: req.id,
          temanId: rec.temanId,
          acceptedByRequesterAt: new Date(),
          acceptedByTemanAt: new Date(),
        }).returning({ id: match.id });
        await db.insert(session).values({ matchId: m.id });
        await notify(rec.requesterId, 'recurringSpawned', { title: rec.title });
        await notify(rec.temanId, 'recurringSpawned', { title: rec.title });
      }
    }
    const next = new Date(rec.nextDate!);
    next.setDate(next.getDate() + (FREQ_DAYS[rec.frequency] ?? 7));
    await db.update(recurring).set({ nextDate: next }).where(eq(recurring.id, rec.id));
  }
  if (due.length) console.log(`recurring-spawn: ${due.length} occurrence(s) handled`);
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

  await boss.createQueue('request-expiry');
  await boss.schedule('request-expiry', '*/10 * * * *');
  await boss.work('request-expiry', expireRequests);

  await boss.createQueue('reminders');
  await boss.schedule('reminders', '*/10 * * * *');
  await boss.work('reminders', sendReminders);

  await boss.createQueue('recurring-spawn');
  await boss.schedule('recurring-spawn', '0 6 * * *', undefined, { tz: 'Asia/Kuala_Lumpur' });
  await boss.work('recurring-spawn', spawnRecurring);

  console.log('worker: jobs — purge-documents, request-expiry, reminders, recurring-spawn');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
