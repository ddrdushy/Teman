import { NextRequest, NextResponse } from 'next/server';
import { and, eq, ne } from 'drizzle-orm';
import { db } from '@/db';
import { request, offer, match, person, session } from '@/db/schema';
import { personIdFromSession } from '@/auth';
import { audit } from '@/lib/privacy';
import { notify } from '@/lib/notify';

/** G6/G8/G10 · withdraw (the Teman's), accept / decline (the requester's).
 *  Accept is the mutual moment: the match row is created with both
 *  timestamps — the offer was the Teman's acceptance — and THAT row is what
 *  unlocks exact location through revealLocation(). Other offers are
 *  auto-declined with an honest message. */
export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const personId = await personIdFromSession();
  if (!personId) return NextResponse.json({ ok: false }, { status: 401 });
  const { id } = await ctx.params;

  let b: { action?: 'withdraw' | 'accept' | 'decline' };
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const o = await db.query.offer.findFirst({ where: eq(offer.id, id) });
  if (!o) return NextResponse.json({ ok: false }, { status: 404 });
  const r = await db.query.request.findFirst({ where: eq(request.id, o.requestId) });
  if (!r) return NextResponse.json({ ok: false }, { status: 404 });

  if (b.action === 'withdraw') {
    if (o.temanId !== personId) return NextResponse.json({ ok: false }, { status: 403 });
    if (o.state !== 'offered') return NextResponse.json({ ok: false }, { status: 409 });
    await db.update(offer).set({ state: 'withdrawn', respondedAt: new Date() })
      .where(eq(offer.id, id));
    return NextResponse.json({ ok: true });
  }

  if (r.requesterId !== personId) return NextResponse.json({ ok: false }, { status: 403 });
  if (o.state !== 'offered' || r.status !== 'looking') {
    return NextResponse.json({ ok: false, reason: 'stale' }, { status: 409 });
  }

  const teman = await db.query.person.findFirst({ where: eq(person.id, o.temanId) });
  const firstName = teman?.displayName.split(/\s+/)[0] ?? '';

  if (b.action === 'decline') {
    await db.update(offer).set({ state: 'declined', respondedAt: new Date() })
      .where(eq(offer.id, id));
    await notify(o.temanId, 'offerDeclined', { title: r.title });
    return NextResponse.json({ ok: true });
  }

  if (b.action === 'accept') {
    const now = new Date();
    await db.update(offer).set({ state: 'accepted', respondedAt: now }).where(eq(offer.id, id));
    const [m] = await db.insert(match).values({
      requestId: r.id,
      temanId: o.temanId,
      acceptedByRequesterAt: now,
      acceptedByTemanAt: o.createdAt,   // the offer WAS the Teman's acceptance
    }).returning({ id: match.id });
    await db.insert(session).values({ matchId: m.id });
    await db.update(request).set({ status: 'matched', updatedAt: now }).where(eq(request.id, r.id));

    /* everyone else declined automatically, honestly */
    const others = await db.query.offer.findMany({
      where: and(eq(offer.requestId, r.id), ne(offer.id, id), eq(offer.state, 'offered')),
    });
    for (const other of others) {
      await db.update(offer).set({ state: 'declined', respondedAt: now }).where(eq(offer.id, other.id));
      await notify(other.temanId, 'offerDeclined', { title: r.title });
    }

    await audit(personId, 'match_created', 'request', r.id, { temanId: o.temanId });
    await notify(o.temanId, 'offerAccepted', { title: r.title });
    await notify(r.requesterId, 'matchConfirmed', { name: firstName });
    return NextResponse.json({ ok: true, matchId: m.id });
  }

  return NextResponse.json({ ok: false }, { status: 400 });
}
