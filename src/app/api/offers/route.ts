import { NextRequest, NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import { request, offer, person, block } from '@/db/schema';
import { personIdFromSession } from '@/auth';
import { audit } from '@/lib/privacy';
import { notify } from '@/lib/notify';

/** G4 · Offer to help. One offer per Teman per request; block-aware;
 *  verified-only respected server-side, not just hidden in discovery. */
export async function POST(req: NextRequest) {
  const personId = await personIdFromSession();
  if (!personId) return NextResponse.json({ ok: false }, { status: 401 });

  let b: { requestId?: string; message?: string };
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const r = b.requestId
    ? await db.query.request.findFirst({ where: eq(request.id, b.requestId) })
    : null;
  if (!r || r.status !== 'looking') {
    return NextResponse.json({ ok: false, reason: 'not_open' }, { status: 409 });
  }
  if (r.requesterId === personId) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const me = await db.query.person.findFirst({ where: eq(person.id, personId) });
  if (!me || me.suspendedAt) return NextResponse.json({ ok: false }, { status: 403 });
  const prefs = (r.prefs ?? {}) as { verifiedOnly?: boolean };
  if (prefs.verifiedOnly && !['identity', 'community', 'enhanced'].includes(me.verificationTier)) {
    return NextResponse.json({ ok: false, reason: 'verified_only' }, { status: 403 });
  }

  const blocked = await db.query.block.findFirst({
    where: and(eq(block.blockerId, r.requesterId), eq(block.blockedId, personId)),
  });
  const blockedRev = await db.query.block.findFirst({
    where: and(eq(block.blockerId, personId), eq(block.blockedId, r.requesterId)),
  });
  if (blocked || blockedRev) return NextResponse.json({ ok: false }, { status: 403 });

  const [row] = await db.insert(offer).values({
    requestId: r.id,
    temanId: personId,
    message: b.message?.trim().slice(0, 400) || null,
  }).onConflictDoNothing().returning({ id: offer.id });
  if (!row) return NextResponse.json({ ok: false, reason: 'already_offered' }, { status: 409 });

  await audit(personId, 'offer_made', 'request', r.id);
  await notify(r.requesterId, 'offerReceived', { name: me.displayName.split(/\s+/)[0] });
  return NextResponse.json({ ok: true, id: row.id });
}
