import { NextRequest, NextResponse } from 'next/server';
import { and, eq, isNull } from 'drizzle-orm';
import { db } from '@/db';
import { trustedTeman, careRecipient } from '@/db/schema';
import { personIdFromSession } from '@/auth';

/** J-01/K1 · Trusted Temans, optionally per recipient ("Mum's Temans"). */
export async function POST(req: NextRequest) {
  const personId = await personIdFromSession();
  if (!personId) return NextResponse.json({ ok: false }, { status: 401 });

  let b: { temanId?: string; forRecipientId?: string | null };
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (!b.temanId || b.temanId === personId) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (b.forRecipientId) {
    const r = await db.query.careRecipient.findFirst({
      where: and(eq(careRecipient.id, b.forRecipientId), eq(careRecipient.managedBy, personId)),
    });
    if (!r) return NextResponse.json({ ok: false }, { status: 400 });
  }

  await db.insert(trustedTeman).values({
    ownerId: personId,
    temanId: b.temanId,
    forRecipientId: b.forRecipientId ?? null,
  }).onConflictDoNothing();
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const personId = await personIdFromSession();
  if (!personId) return NextResponse.json({ ok: false }, { status: 401 });
  const url = new URL(req.url);
  const temanId = url.searchParams.get('temanId');
  const forRecipientId = url.searchParams.get('forRecipientId');
  if (!temanId) return NextResponse.json({ ok: false }, { status: 400 });
  await db.delete(trustedTeman).where(and(
    eq(trustedTeman.ownerId, personId),
    eq(trustedTeman.temanId, temanId),
    forRecipientId ? eq(trustedTeman.forRecipientId, forRecipientId) : isNull(trustedTeman.forRecipientId),
  ));
  return NextResponse.json({ ok: true });
}
