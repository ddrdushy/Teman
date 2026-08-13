import { NextRequest, NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import { feedback, session, match, request, report, person } from '@/db/schema';
import { personIdFromSession } from '@/auth';
import { audit } from '@/lib/privacy';

const DESCRIPTORS = ['kind', 'respectful', 'patient', 'reliable', 'helpful', 'goodListener'] as const;

/* J1/J2 · Descriptors are public words. feltSafe and wouldMeetAgain are
   PRIVATE: never rendered anywhere, and a "no" on safety opens a case and
   restricts matching immediately — it never touches a number (I-02, I-04). */
export async function POST(req: NextRequest) {
  const personId = await personIdFromSession();
  if (!personId) return NextResponse.json({ ok: false }, { status: 401 });

  let b: {
    sessionId?: string;
    descriptors?: string[];
    feltSafe?: boolean;
    wouldMeetAgain?: boolean;
    privateNote?: string;
  };
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const s = b.sessionId
    ? await db.query.session.findFirst({ where: eq(session.id, b.sessionId) })
    : null;
  if (!s || s.state !== 'ended') {
    return NextResponse.json({ ok: false, reason: 'not_ended' }, { status: 409 });
  }
  const m = await db.query.match.findFirst({ where: eq(match.id, s.matchId) });
  const r = m ? await db.query.request.findFirst({ where: eq(request.id, m.requestId) }) : null;
  if (!m || !r) return NextResponse.json({ ok: false }, { status: 404 });
  const isRequester = personId === r.requesterId;
  if (!isRequester && personId !== m.temanId) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  const existing = await db.query.feedback.findFirst({
    where: and(eq(feedback.sessionId, s.id), eq(feedback.fromPerson, personId)),
  });
  if (existing) return NextResponse.json({ ok: false, reason: 'already' }, { status: 409 });

  const aboutPerson = isRequester ? m.temanId : r.requesterId;
  await db.insert(feedback).values({
    sessionId: s.id,
    fromPerson: personId,
    aboutPerson,
    role: isRequester ? 'requester' : 'teman',
    descriptors: (b.descriptors ?? []).filter((d) =>
      (DESCRIPTORS as readonly string[]).includes(d)).slice(0, 6),
    feltSafe: typeof b.feltSafe === 'boolean' ? b.feltSafe : null,
    wouldMeetAgain: typeof b.wouldMeetAgain === 'boolean' ? b.wouldMeetAgain : null,
    privateNote: b.privateNote?.trim().slice(0, 800) || null,
  });

  if (b.feltSafe === false) {
    /* the single line that keeps Teman from becoming a rating platform:
       a "no" opens a case and restricts matching — it never lowers anything */
    const [row] = await db.insert(report).values({
      reporterId: personId,
      subjectPersonId: aboutPerson,
      sessionId: s.id,
      category: 'feltUnsafe',
      detail: null,
      severity: 'high',
      status: 'open',
    }).returning({ id: report.id });
    await db.update(person).set({ suspendedAt: new Date(), updatedAt: new Date() })
      .where(eq(person.id, aboutPerson));
    await audit(null, 'incident_auto_created', 'report', row.id, { from: 'felt_safe_false' });
  }

  await audit(personId, 'feedback_given', 'session', s.id);
  return NextResponse.json({ ok: true });
}
