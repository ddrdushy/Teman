import { NextRequest, NextResponse } from 'next/server';
import { and, eq, sql as dsql } from 'drizzle-orm';
import { db } from '@/db';
import { availability, person, area } from '@/db/schema';
import { personIdFromSession } from '@/auth';

const RADII = { walking: 1000, area: 5000, city: 25000 } as const;

/** F1/F2/F4 save; DELETE removes a slot (Toast offers undo by re-POSTing). */
export async function POST(req: NextRequest) {
  const personId = await personIdFromSession();
  if (!personId) return NextResponse.json({ ok: false }, { status: 401 });

  let body: {
    id?: string;
    date?: string;      // YYYY-MM-DD
    from?: string;      // HH:MM
    until?: string;     // HH:MM
    radius?: keyof typeof RADII;
    categories?: string[];
    transport?: string[];
    repeatsWeekly?: boolean;
    /* set => this is a journey (F5): availability with a destination */
    destinationAreaId?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(body.date ?? '') ||
      !/^\d{2}:\d{2}$/.test(body.from ?? '') ||
      !/^\d{2}:\d{2}$/.test(body.until ?? '') ||
      !(body.radius && body.radius in RADII)) {
    return NextResponse.json({ ok: false, reason: 'incomplete' }, { status: 400 });
  }
  const startsAt = new Date(`${body.date}T${body.from}:00+08:00`);
  const endsAt = new Date(`${body.date}T${body.until}:00+08:00`);
  if (!(endsAt > startsAt)) {
    return NextResponse.json({ ok: false, reason: 'window' }, { status: 400 });
  }

  const p = await db.query.person.findFirst({ where: eq(person.id, personId) });
  if (!p?.areaId) return NextResponse.json({ ok: false }, { status: 400 });

  /* centre = the member's jittered home point; fall back to area centroid */
  let centre = p.approxPoint as string | null;
  if (!centre) {
    const [a] = await db.select({
      wkt: dsql<string>`ST_AsText(${area.centroid}::geometry)`,
    }).from(area).where(eq(area.id, p.areaId));
    centre = a?.wkt ?? null;
  }
  if (!centre) return NextResponse.json({ ok: false }, { status: 400 });

  let destinationPoint: string | null = null;
  if (body.destinationAreaId) {
    const [dest] = await db.select({
      wkt: dsql<string>`ST_AsText(${area.centroid}::geometry)`,
    }).from(area).where(eq(area.id, body.destinationAreaId));
    if (!dest?.wkt) return NextResponse.json({ ok: false, reason: 'unknown_area' }, { status: 400 });
    destinationPoint = dest.wkt;
  }

  const values = {
    startsAt,
    endsAt,
    areaId: p.areaId,
    centrePoint: centre,
    radiusM: RADII[body.radius],
    categories: body.categories ?? [],
    transport: body.transport ?? [],
    repeatsWeekly: Boolean(body.repeatsWeekly),
    destinationPoint,
    isActive: true,
  };

  if (body.id) {
    const existing = await db.query.availability.findFirst({
      where: and(eq(availability.id, body.id), eq(availability.personId, personId)),
    });
    if (!existing) return NextResponse.json({ ok: false }, { status: 404 });
    await db.update(availability).set(values).where(eq(availability.id, body.id));
    return NextResponse.json({ ok: true, id: body.id });
  }

  const [row] = await db.insert(availability)
    .values({ personId, ...values })
    .returning({ id: availability.id });
  return NextResponse.json({ ok: true, id: row.id });
}

export async function DELETE(req: NextRequest) {
  const personId = await personIdFromSession();
  if (!personId) return NextResponse.json({ ok: false }, { status: 401 });
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ ok: false }, { status: 400 });
  await db.delete(availability)
    .where(and(eq(availability.id, id), eq(availability.personId, personId)));
  return NextResponse.json({ ok: true });
}
