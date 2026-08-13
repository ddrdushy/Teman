import { NextRequest, NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import { request, offer, match } from '@/db/schema';
import { personIdFromSession } from '@/auth';
import { audit } from '@/lib/privacy';
import { notify } from '@/lib/notify';

/** E15/E16 · edit and cancel, owner only. Cancellation notifies the matched
 *  Teman honestly and thanks them — never penalises. */
export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const personId = await personIdFromSession();
  if (!personId) return NextResponse.json({ ok: false }, { status: 401 });
  const { id } = await ctx.params;

  const row = await db.query.request.findFirst({
    where: and(eq(request.id, id), eq(request.requesterId, personId)),
  });
  if (!row) return NextResponse.json({ ok: false }, { status: 404 });

  let b: { action?: string; description?: string; exactAddress?: string };
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (b.action === 'cancel') {
    if (['completed', 'cancelled', 'expired'].includes(row.status)) {
      return NextResponse.json({ ok: false, reason: 'final' }, { status: 409 });
    }
    await db.update(request).set({ status: 'cancelled', updatedAt: new Date() })
      .where(eq(request.id, id));
    const m = await db.query.match.findFirst({ where: eq(match.requestId, id) });
    if (m) {
      /* the volunteer is thanked, not penalised (docs/06 §13) */
      await notify(m.temanId, 'requestCancelledByRequester', { title: row.title });
    }
    await audit(personId, 'request_cancelled', 'request', id);
    return NextResponse.json({ ok: true });
  }

  if (b.action === 'edit') {
    if (row.status !== 'looking') {
      return NextResponse.json({ ok: false, reason: 'not_editable' }, { status: 409 });
    }
    await db.update(request).set({
      ...(typeof b.description === 'string' ? { description: b.description.trim().slice(0, 800) } : {}),
      ...(typeof b.exactAddress === 'string' ? { exactAddress: b.exactAddress.trim().slice(0, 300) } : {}),
      updatedAt: new Date(),
    }).where(eq(request.id, id));
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: false }, { status: 400 });
}
