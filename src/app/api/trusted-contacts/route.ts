import { NextRequest, NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import { trustedContact } from '@/db/schema';
import { personIdFromSession } from '@/auth';
import { normaliseMyPhone } from '@/lib/otp';

/** I9/I10 · Trusted contacts. Phone numbers are for SMS only — never shown
 *  to Temans, never matched against members. */
export async function POST(req: NextRequest) {
  const personId = await personIdFromSession();
  if (!personId) return NextResponse.json({ ok: false }, { status: 401 });

  let b: { name?: string; phone?: string; relationship?: string };
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const phone = normaliseMyPhone(b.phone ?? '');
  if (!b.name?.trim() || !phone) {
    return NextResponse.json({ ok: false, reason: 'incomplete' }, { status: 400 });
  }

  const [row] = await db.insert(trustedContact).values({
    personId,
    name: b.name.trim().slice(0, 60),
    phone,
    relationship: b.relationship?.trim().slice(0, 40) || null,
    notifyOn: { start: true, end: true },
  }).returning({ id: trustedContact.id });
  return NextResponse.json({ ok: true, id: row.id });
}

export async function DELETE(req: NextRequest) {
  const personId = await personIdFromSession();
  if (!personId) return NextResponse.json({ ok: false }, { status: 401 });
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ ok: false }, { status: 400 });
  await db.delete(trustedContact)
    .where(and(eq(trustedContact.id, id), eq(trustedContact.personId, personId)));
  return NextResponse.json({ ok: true });
}
