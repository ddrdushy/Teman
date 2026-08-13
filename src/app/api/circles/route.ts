import { NextRequest, NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import { circle, circleMember } from '@/db/schema';
import { personIdFromSession } from '@/auth';
import { audit } from '@/lib/privacy';

/** K6–K9 · Circles. Creation needs admin approval (status pending);
 *  joining follows the circle's policy. */
export async function POST(req: NextRequest) {
  const personId = await personIdFromSession();
  if (!personId) return NextResponse.json({ ok: false }, { status: 401 });

  let b: { action?: 'create' | 'join' | 'leave'; circleId?: string; name?: string; areaId?: string; joinPolicy?: string };
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (b.action === 'create') {
    if (!b.name?.trim()) return NextResponse.json({ ok: false }, { status: 400 });
    const [row] = await db.insert(circle).values({
      name: b.name.trim().slice(0, 80),
      areaId: b.areaId ?? null,
      joinPolicy: b.joinPolicy === 'approval' ? 'approval' : 'open',
      status: 'pending',   // an admin approves it (N17)
      createdBy: personId,
    }).returning({ id: circle.id });
    await db.insert(circleMember).values({
      circleId: row.id, personId, role: 'coordinator', state: 'member',
    });
    await audit(personId, 'circle_created', 'circle', row.id);
    return NextResponse.json({ ok: true, id: row.id });
  }

  if (b.action === 'join') {
    const c = b.circleId
      ? await db.query.circle.findFirst({ where: eq(circle.id, b.circleId) })
      : null;
    if (!c || c.status !== 'active') return NextResponse.json({ ok: false }, { status: 404 });
    await db.insert(circleMember).values({
      circleId: c.id,
      personId,
      state: c.joinPolicy === 'approval' ? 'pending' : 'member',
    }).onConflictDoNothing();
    return NextResponse.json({ ok: true, pending: c.joinPolicy === 'approval' });
  }

  if (b.action === 'leave') {
    if (!b.circleId) return NextResponse.json({ ok: false }, { status: 400 });
    await db.delete(circleMember).where(and(
      eq(circleMember.circleId, b.circleId), eq(circleMember.personId, personId),
    ));
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: false }, { status: 400 });
}
