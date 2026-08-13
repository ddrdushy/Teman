import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { person } from '@/db/schema';
import { requireRole } from '@/lib/admin';
import { audit } from '@/lib/privacy';

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const actor = await requireRole(['admin']);
  if (!actor) return NextResponse.json({ ok: false }, { status: 403 });
  const { id } = await ctx.params;

  let b: { action?: string; reason?: string };
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (!b.reason?.trim()) return NextResponse.json({ ok: false }, { status: 400 });
  if (b.action !== 'restrict' && b.action !== 'reinstate') {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  await db.update(person)
    .set({ suspendedAt: b.action === 'restrict' ? new Date() : null, updatedAt: new Date() })
    .where(eq(person.id, id));
  await audit(actor.id, `user_${b.action}ed`, 'person', id, { reason: b.reason });
  return NextResponse.json({ ok: true });
}
