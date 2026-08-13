import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { recurring, session, match, request } from '@/db/schema';
import { personIdFromSession } from '@/auth';
import { audit } from '@/lib/privacy';
import { notify } from '@/lib/notify';

const FREQ_DAYS = { weekly: 7, fortnightly: 14, monthly: 28 } as const;

/** K3 · Propose recurring after a completed session. Both parties must
 *  agree before anything is scheduled. */
export async function POST(req: NextRequest) {
  const personId = await personIdFromSession();
  if (!personId) return NextResponse.json({ ok: false }, { status: 401 });

  let b: { sessionId?: string; frequency?: keyof typeof FREQ_DAYS; timeOfDay?: string };
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (!b.frequency || !(b.frequency in FREQ_DAYS) || !/^\d{2}:\d{2}$/.test(b.timeOfDay ?? '')) {
    return NextResponse.json({ ok: false, reason: 'incomplete' }, { status: 400 });
  }

  const s = b.sessionId
    ? await db.query.session.findFirst({ where: eq(session.id, b.sessionId) })
    : null;
  if (!s || s.state !== 'ended') return NextResponse.json({ ok: false }, { status: 409 });
  const m = await db.query.match.findFirst({ where: eq(match.id, s.matchId) });
  const r = m ? await db.query.request.findFirst({ where: eq(request.id, m.requestId) }) : null;
  if (!m || !r) return NextResponse.json({ ok: false }, { status: 404 });
  if (personId !== r.requesterId && personId !== m.temanId) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  const next = new Date(r.startsAt);
  while (next.getTime() < Date.now()) next.setDate(next.getDate() + FREQ_DAYS[b.frequency]);

  const [row] = await db.insert(recurring).values({
    requesterId: r.requesterId,
    temanId: m.temanId,
    forRecipientId: r.beneficiaryId,
    categoryId: r.categoryId,
    title: r.title,
    frequency: b.frequency,
    timeOfDay: b.timeOfDay!,
    proposedBy: personId,
    nextDate: next,
  }).returning({ id: recurring.id });

  const other = personId === r.requesterId ? m.temanId : r.requesterId;
  await notify(other, 'recurringProposed', { title: r.title });
  await audit(personId, 'recurring_proposed', 'recurring', row.id);
  return NextResponse.json({ ok: true, id: row.id });
}

/** K4/K5 · Agree, pause, or end. Ending requires no reason — someone who
 *  feels trapped in an obligation stops using the product entirely. */
export async function PATCH(req: NextRequest) {
  const personId = await personIdFromSession();
  if (!personId) return NextResponse.json({ ok: false }, { status: 401 });

  let b: { id?: string; action?: 'agree' | 'pause' | 'resume' | 'end' };
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const row = b.id ? await db.query.recurring.findFirst({ where: eq(recurring.id, b.id) }) : null;
  if (!row) return NextResponse.json({ ok: false }, { status: 404 });
  if (personId !== row.requesterId && personId !== row.temanId) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  const transitions: Record<string, { from: string[]; to: string; othersOnly?: boolean }> = {
    agree: { from: ['proposed'], to: 'active', othersOnly: true },
    pause: { from: ['active'], to: 'paused' },
    resume: { from: ['paused'], to: 'active' },
    end: { from: ['proposed', 'active', 'paused'], to: 'ended' },
  };
  const tr = transitions[b.action ?? ''];
  if (!tr || !tr.from.includes(row.state)) {
    return NextResponse.json({ ok: false, reason: 'state' }, { status: 409 });
  }
  if (tr.othersOnly && personId === row.proposedBy) {
    return NextResponse.json({ ok: false, reason: 'other_party' }, { status: 403 });
  }

  await db.update(recurring).set({ state: tr.to }).where(eq(recurring.id, row.id));
  const other = personId === row.requesterId ? row.temanId : row.requesterId;
  if (b.action === 'agree') await notify(other, 'recurringAgreed', { title: row.title });
  if (b.action === 'end') await notify(other, 'recurringEnded', { title: row.title });
  await audit(personId, `recurring_${b.action}`, 'recurring', row.id);
  return NextResponse.json({ ok: true });
}
