import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { request } from '@/db/schema';
import { requireRole } from '@/lib/admin';
import { audit } from '@/lib/privacy';
import { notify } from '@/lib/notify';

/** N15 · Keep (clears the flag) or remove (cancels with notification). */
export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const actor = await requireRole(['admin']);
  if (!actor) return NextResponse.json({ ok: false }, { status: 403 });
  const { id } = await ctx.params;

  let b: { action?: 'keep' | 'remove' };
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const r = await db.query.request.findFirst({ where: eq(request.id, id) });
  if (!r) return NextResponse.json({ ok: false }, { status: 404 });

  if (b.action === 'keep') {
    await db.update(request).set({ flaggedReason: null, updatedAt: new Date() })
      .where(eq(request.id, id));
    await audit(actor.id, 'flagged_request_kept', 'request', id);
    return NextResponse.json({ ok: true });
  }
  if (b.action === 'remove') {
    await db.update(request).set({ status: 'cancelled', updatedAt: new Date() })
      .where(eq(request.id, id));
    await notify(r.requesterId, 'requestRemovedByModeration', { title: r.title });
    await audit(actor.id, 'flagged_request_removed', 'request', id);
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ ok: false }, { status: 400 });
}
