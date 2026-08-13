import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { circle } from '@/db/schema';
import { requireRole } from '@/lib/admin';
import { audit } from '@/lib/privacy';

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const actor = await requireRole(['coordinator', 'admin']);
  if (!actor) return NextResponse.json({ ok: false }, { status: 403 });
  const { id } = await ctx.params;

  let b: { action?: string };
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (b.action !== 'approve') return NextResponse.json({ ok: false }, { status: 400 });

  await db.update(circle).set({ status: 'active' }).where(eq(circle.id, id));
  await audit(actor.id, 'circle_approved', 'circle', id);
  return NextResponse.json({ ok: true });
}
