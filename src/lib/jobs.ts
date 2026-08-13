/**
 * The background jobs, host-agnostic. On the VPS pg-boss schedules them
 * (src/worker.ts); on serverless the /api/jobs/run route fires them on an
 * external cron. Same functions, one source of truth.
 */

import { and, eq, gt, isNotNull, lt, sql } from 'drizzle-orm';
import { db } from '@/db';
import {
  verification, request, match, notification, recurring, session,
  person as personTable,
} from '@/db/schema';
import { deleteStoredObject } from '@/lib/storage';
import { audit } from '@/lib/privacy';
import { notify } from '@/lib/notify';

/** C-07: reviewed documents are deleted 90 days after review. */
export async function purgeDocuments() {
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
  return due.length;
}

/** D-19: the honest notice, sent BEFORE the date. */
export async function expireRequests() {
  const due = await db.select().from(request).where(
    and(eq(request.status, 'looking'), lt(request.expiresAt, new Date())),
  );
  for (const r of due) {
    await db.update(request).set({ status: 'expired', updatedAt: new Date() })
      .where(eq(request.id, r.id));
    await notify(r.requesterId, 'requestExpired', { title: r.title });
  }
  return due.length;
}

/** G-05: reminders at 24h and 2h, both parties, exactly once. */
export async function sendReminders() {
  let sent = 0;
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
      sent++;
    }
  }
  return sent;
}

/** J-02/K3: each active recurring occurrence spawns pre-matched, ~3 days out. */
export async function spawnRecurring() {
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
  return due.length;
}

/** E12: after the ask-trusted-first window, widen back to everyone nearby. */
export async function widenVisibility() {
  const due = await db.select().from(request).where(and(
    eq(request.status, 'looking'),
    eq(request.visibility, 'trusted_only'),
    sql`${request.prefs}->>'widenPublicAt' IS NOT NULL`,
    sql`(${request.prefs}->>'widenPublicAt')::timestamptz < now()`,
  ));
  for (const r of due) {
    const prefs = { ...((r.prefs as object) ?? {}) } as Record<string, unknown>;
    delete prefs.widenPublicAt;
    await db.update(request).set({ visibility: 'public', prefs, updatedAt: new Date() })
      .where(eq(request.id, r.id));
  }
  return due.length;
}

/** Everything due, in one pass — the serverless entry point. */
export async function runAllDueJobs() {
  return {
    expired: await expireRequests(),
    reminders: await sendReminders(),
    widened: await widenVisibility(),
    recurringSpawned: await spawnRecurring(),
    purged: await purgeDocuments(),
  };
}
