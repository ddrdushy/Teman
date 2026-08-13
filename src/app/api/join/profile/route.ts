import { NextRequest, NextResponse } from 'next/server';
import { eq, sql } from 'drizzle-orm';
import { db } from '@/db';
import { person, area } from '@/db/schema';
import { personIdFromSession } from '@/auth';
import { jitterPoint, toWkt } from '@/lib/geo';

/** A5 (name) and A6 (area) both save through here. Area also sets the
 *  jittered approxPoint — the exact centroid never lands on the person row. */
export async function POST(req: NextRequest) {
  const personId = await personIdFromSession();
  if (!personId) return NextResponse.json({ ok: false }, { status: 401 });

  let body: { displayName?: string; areaId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (typeof body.displayName === 'string') {
    const name = body.displayName.trim();
    if (!name || name.length > 60) {
      return NextResponse.json({ ok: false, reason: 'invalid_name' }, { status: 400 });
    }
    await db.update(person)
      .set({ displayName: name, updatedAt: new Date() })
      .where(eq(person.id, personId));
    return NextResponse.json({ ok: true });
  }

  if (typeof body.areaId === 'string') {
    const [row] = await db
      .select({
        id: area.id,
        lat: sql<number>`ST_Y(${area.centroid}::geometry)`,
        lng: sql<number>`ST_X(${area.centroid}::geometry)`,
      })
      .from(area)
      .where(eq(area.id, body.areaId));
    if (!row) return NextResponse.json({ ok: false, reason: 'unknown_area' }, { status: 400 });

    const j = row.lat != null ? jitterPoint(row.lat, row.lng) : null;
    await db.update(person)
      .set({
        areaId: row.id,
        ...(j ? { approxPoint: toWkt(j.lat, j.lng) } : {}),
        updatedAt: new Date(),
      })
      .where(eq(person.id, personId));
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: false }, { status: 400 });
}
