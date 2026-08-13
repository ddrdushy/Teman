import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { report, person, block, session, match, request } from '@/db/schema';
import { personIdFromSession } from '@/auth';
import { audit } from '@/lib/privacy';

/* §36 categories. The serious set restricts matching IMMEDIATELY, pending
   review — the system opens the case, a human closes it. */
const CATEGORIES = [
  'harassment', 'romanticSexual', 'moneyRequest', 'fraud',
  'unsafeDriving', 'impersonation', 'discrimination', 'abuse', 'other',
] as const;
const SERIOUS = new Set(['harassment', 'romanticSexual', 'moneyRequest', 'fraud', 'abuse', 'impersonation']);

export async function POST(req: NextRequest) {
  const personId = await personIdFromSession();
  if (!personId) return NextResponse.json({ ok: false }, { status: 401 });

  let b: { category?: string; detail?: string; sessionId?: string; subjectPersonId?: string };
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (!CATEGORIES.includes(b.category as (typeof CATEGORIES)[number])) {
    return NextResponse.json({ ok: false, reason: 'category' }, { status: 400 });
  }

  /* subject can come explicitly or from the session's other party */
  let subjectId = b.subjectPersonId ?? null;
  if (!subjectId && b.sessionId) {
    const s = await db.query.session.findFirst({ where: eq(session.id, b.sessionId) });
    const m = s ? await db.query.match.findFirst({ where: eq(match.id, s.matchId) }) : null;
    const r = m ? await db.query.request.findFirst({ where: eq(request.id, m.requestId) }) : null;
    if (m && r) subjectId = personId === r.requesterId ? m.temanId : r.requesterId;
  }
  if (!subjectId || subjectId === personId) {
    return NextResponse.json({ ok: false, reason: 'subject' }, { status: 400 });
  }

  const serious = SERIOUS.has(b.category!);
  const [row] = await db.insert(report).values({
    reporterId: personId,
    subjectPersonId: subjectId,
    sessionId: b.sessionId ?? null,
    category: b.category!,
    detail: b.detail?.trim().slice(0, 1200) || null,
    severity: serious ? 'urgent' : 'low',
    status: 'open',
  }).returning({ id: report.id });

  if (serious) {
    /* restriction is immediate; the review decides what happens next */
    await db.update(person).set({ suspendedAt: new Date(), updatedAt: new Date() })
      .where(eq(person.id, subjectId));
  }
  await audit(personId, 'report_filed', 'report', row.id, {
    category: b.category, serious, subjectPersonId: subjectId,
  });

  return NextResponse.json({ ok: true, id: row.id });
}
