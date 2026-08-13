import { NextRequest, NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import { block } from '@/db/schema';
import { personIdFromSession } from '@/auth';
import { audit } from '@/lib/privacy';

/** H-12 · Block: mutual invisibility, enforced inside the discovery query
 *  and the offer API — not just hidden in UI. */
export async function POST(req: NextRequest) {
  const personId = await personIdFromSession();
  if (!personId) return NextResponse.json({ ok: false }, { status: 401 });
  let b: { personId?: string };
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (!b.personId || b.personId === personId) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  await db.insert(block).values({ blockerId: personId, blockedId: b.personId })
    .onConflictDoNothing();
  await audit(personId, 'person_blocked', 'person', b.personId);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const personId = await personIdFromSession();
  if (!personId) return NextResponse.json({ ok: false }, { status: 401 });
  const target = new URL(req.url).searchParams.get('personId');
  if (!target) return NextResponse.json({ ok: false }, { status: 400 });
  await db.delete(block)
    .where(and(eq(block.blockerId, personId), eq(block.blockedId, target)));
  await audit(personId, 'person_unblocked', 'person', target);
  return NextResponse.json({ ok: true });
}
