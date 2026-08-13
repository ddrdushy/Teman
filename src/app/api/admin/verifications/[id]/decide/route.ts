import { NextRequest, NextResponse } from 'next/server';
import { and, asc, eq, ne } from 'drizzle-orm';
import { db } from '@/db';
import { verification, person } from '@/db/schema';
import { requireRole } from '@/lib/admin';
import { audit } from '@/lib/privacy';
import { notify } from '@/lib/notify';

const REASON_KEYS = ['blurry', 'cutOff', 'nameMismatch', 'expired', 'notAnId', 'other'] as const;
const PURGE_DAYS = 90;

/** Approve or reject one verification. Every decision writes to audit_log;
 *  both outcomes set the 90-day purge clock and notify the member in their
 *  own language (kind + params, rendered at read time). */
export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const actor = await requireRole(['coordinator', 'admin']);
  if (!actor) return NextResponse.json({ ok: false }, { status: 403 });

  const { id } = await ctx.params;
  let body: { decision?: string; reasonKey?: string; note?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const row = await db.query.verification.findFirst({ where: eq(verification.id, id) });
  if (!row || row.state !== 'pending') {
    return NextResponse.json({ ok: false, reason: 'not_pending' }, { status: 409 });
  }

  const purgeAfter = new Date(Date.now() + PURGE_DAYS * 24 * 3600 * 1000);

  if (body.decision === 'approve') {
    await db.update(verification)
      .set({ state: 'approved', reviewedBy: actor.id, reviewedAt: new Date(), purgeAfter })
      .where(eq(verification.id, id));
    await db.update(person)
      .set({ verificationTier: row.tier, updatedAt: new Date() })
      .where(eq(person.id, row.personId));
    await audit(actor.id, 'verification_approved', 'verification', id, { subjectPerson: row.personId });
    await notify(row.personId, 'verificationApproved');
  } else if (body.decision === 'reject') {
    const reasonKey = REASON_KEYS.includes(body.reasonKey as (typeof REASON_KEYS)[number])
      ? body.reasonKey!
      : 'other';
    const reason = body.note ? `${reasonKey}: ${body.note}` : reasonKey;
    await db.update(verification)
      .set({ state: 'rejected', reviewedBy: actor.id, reviewedAt: new Date(), rejectReason: reason, purgeAfter })
      .where(eq(verification.id, id));
    await audit(actor.id, 'verification_rejected', 'verification', id, {
      subjectPerson: row.personId, reasonKey,
    });
    await notify(row.personId, 'verificationRejected', { reason });
  } else {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  /* → next: the queue is worked oldest-first without going back to the list */
  const next = await db.query.verification.findFirst({
    where: and(eq(verification.state, 'pending'), ne(verification.id, id)),
    orderBy: asc(verification.createdAt),
    columns: { id: true },
  });

  return NextResponse.json({ ok: true, nextId: next?.id ?? null });
}
