import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { match, request } from '@/db/schema';
import { personIdFromSession } from '@/auth';
import { audit } from '@/lib/privacy';
import { notify } from '@/lib/notify';

/** H8 · Cancel after matching, either side. Honest notification; the request
 *  returns to Looking if there is still time for someone else. */
export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const personId = await personIdFromSession();
  if (!personId) return NextResponse.json({ ok: false }, { status: 401 });
  const { id } = await ctx.params;

  const m = await db.query.match.findFirst({ where: eq(match.id, id) });
  if (!m) return NextResponse.json({ ok: false }, { status: 404 });
  const r = await db.query.request.findFirst({ where: eq(request.id, m.requestId) });
  if (!r) return NextResponse.json({ ok: false }, { status: 404 });
  if (personId !== r.requesterId && personId !== m.temanId) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }
  if (!['matched', 'active'].includes(r.status)) {
    return NextResponse.json({ ok: false, reason: 'final' }, { status: 409 });
  }

  const timeLeft = r.startsAt.getTime() - Date.now() > 2 * 3600_000;
  const backToLooking = timeLeft && r.expiresAt.getTime() > Date.now();

  await db.delete(match).where(eq(match.id, id));
  await db.update(request)
    .set({ status: backToLooking ? 'looking' : 'cancelled', updatedAt: new Date() })
    .where(eq(request.id, r.id));

  const other = personId === r.requesterId ? m.temanId : r.requesterId;
  await notify(other,
    personId === r.requesterId ? 'requestCancelledByRequester' : 'matchCancelledByTeman',
    { title: r.title });
  await audit(personId, 'match_cancelled', 'request', r.id);

  return NextResponse.json({ ok: true, backToLooking });
}
