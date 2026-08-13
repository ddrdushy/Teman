import { NextRequest, NextResponse } from 'next/server';
import { and, desc, eq, sql as dsql } from 'drizzle-orm';
import { db } from '@/db';
import { request, area, careRecipient, category, trustedTeman } from '@/db/schema';
import { personIdFromSession } from '@/auth';
import { jitterPoint, toWkt } from '@/lib/geo';
import { audit } from '@/lib/privacy';
import { triageText } from '@/lib/moderation';

const GENDERS = ['any', 'women', 'men'] as const;

/* Publish a request (E1–E11). starts_at drives urgency; expires_at drives
   the honest notice — the evening before, never the morning of. */
export async function POST(req: NextRequest) {
  const personId = await personIdFromSession();
  if (!personId) return NextResponse.json({ ok: false }, { status: 401 });

  let b: {
    categoryId?: string;
    beneficiaryType?: 'self' | 'care_recipient';
    beneficiaryId?: string;
    destinationText?: string;
    areaId?: string;
    exactAddress?: string;
    whenType?: 'asap' | 'today' | 'date';
    date?: string;
    time?: string;
    durationMin?: number;
    description?: string;
    mood?: string[];
    prefs?: { gender?: string; languages?: string[]; verifiedOnly?: boolean; driving?: boolean };
    visibility?: 'public' | 'circles' | 'trusted_only';
  };
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const cat = b.categoryId
    ? await db.query.category.findFirst({ where: eq(category.id, b.categoryId) })
    : null;
  const a = b.areaId ? await db.query.area.findFirst({ where: eq(area.id, b.areaId) }) : null;
  if (!cat || !a || !b.destinationText?.trim()) {
    return NextResponse.json({ ok: false, reason: 'incomplete' }, { status: 400 });
  }

  if (b.beneficiaryType === 'care_recipient') {
    const r = await db.query.careRecipient.findFirst({
      where: and(eq(careRecipient.id, b.beneficiaryId ?? ''), eq(careRecipient.managedBy, personId)),
    });
    if (!r) return NextResponse.json({ ok: false, reason: 'unknown_recipient' }, { status: 400 });
  }

  const now = Date.now();
  let startsAt: Date;
  let urgency: 'planned' | 'today' | 'soon' = 'planned';
  if (b.whenType === 'asap') {
    startsAt = new Date(now + 2 * 3600_000);
    urgency = 'soon';
  } else if (b.whenType === 'today') {
    startsAt = new Date(`${new Date().toISOString().slice(0, 10)}T${b.time ?? '12:00'}:00+08:00`);
    urgency = 'today';
  } else {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(b.date ?? '')) {
      return NextResponse.json({ ok: false, reason: 'when' }, { status: 400 });
    }
    startsAt = new Date(`${b.date}T${b.time ?? '09:00'}:00+08:00`);
  }
  if (startsAt.getTime() < now - 3600_000) {
    return NextResponse.json({ ok: false, reason: 'past' }, { status: 400 });
  }
  const durationMin = Math.min(Math.max(b.durationMin ?? 120, 30), 12 * 60);
  const endsAt = new Date(startsAt.getTime() + durationMin * 60_000);

  /* honest-notice clock: half a day before, never later than 1h before,
     never in the past */
  const expiresAt = new Date(Math.max(
    Math.min(startsAt.getTime() - 12 * 3600_000, startsAt.getTime() - 3600_000),
    now + 30 * 60_000,
  ));

  const [centroid] = await db.select({
    lat: dsql<number>`ST_Y(${area.centroid}::geometry)`,
    lng: dsql<number>`ST_X(${area.centroid}::geometry)`,
  }).from(area).where(eq(area.id, a.id));
  if (centroid?.lat == null) return NextResponse.json({ ok: false }, { status: 400 });
  const j = jitterPoint(centroid.lat, centroid.lng);

  const prefs = {
    gender: GENDERS.includes(b.prefs?.gender as (typeof GENDERS)[number]) ? b.prefs!.gender : 'any',
    languages: (b.prefs?.languages ?? []).slice(0, 7),
    verifiedOnly: Boolean(b.prefs?.verifiedOnly),
    driving: Boolean(b.prefs?.driving),
    mood: (b.mood ?? []).slice(0, 4),
  };

  /* triage flags, never blocks — a person reviews in N15 */
  const flags = await triageText(
    `${b.destinationText} ${b.description ?? ''}`,
    'en',
  );

  const [row] = await db.insert(request).values({
    requesterId: personId,
    beneficiaryType: b.beneficiaryType === 'care_recipient' ? 'care_recipient' : 'self',
    beneficiaryId: b.beneficiaryType === 'care_recipient' ? b.beneficiaryId : null,
    categoryId: cat.id,
    status: 'looking',
    urgency,
    title: b.destinationText.trim().slice(0, 120),
    description: b.description?.trim().slice(0, 800) || null,
    areaId: a.id,
    approxPoint: toWkt(j.lat, j.lng),
    exactPoint: toWkt(centroid.lat, centroid.lng),
    exactAddress: b.exactAddress?.trim().slice(0, 300) || null,
    startsAt,
    endsAt,
    isFlexible: b.whenType === 'asap',
    prefs,
    visibility: b.visibility === 'circles' || b.visibility === 'trusted_only' ? b.visibility : 'public',
    flaggedReason: flags.length ? flags.join(',') : null,
    expiresAt,
  }).returning({ id: request.id });

  await audit(personId, 'request_published', 'request', row.id);

  /* E12: tell the client whether "ask trusted first" is worth offering */
  const trusted = await db.select({ n: dsql<number>`count(*)::int` }).from(trustedTeman)
    .where(and(eq(trustedTeman.ownerId, personId),
      b.beneficiaryType === 'care_recipient'
        ? eq(trustedTeman.forRecipientId, b.beneficiaryId!)
        : dsql`${trustedTeman.forRecipientId} IS NULL`));

  return NextResponse.json({
    ok: true, id: row.id, expiresAt: expiresAt.toISOString(),
    trustedCount: trusted[0]?.n ?? 0,
  });
}

/** E13 · my requests, all states. */
export async function GET() {
  const personId = await personIdFromSession();
  if (!personId) return NextResponse.json({ ok: false }, { status: 401 });
  const rows = await db.query.request.findMany({
    where: eq(request.requesterId, personId),
    orderBy: desc(request.startsAt),
    columns: {
      id: true, title: true, status: true, urgency: true, startsAt: true,
      beneficiaryType: true, beneficiaryId: true, categoryId: true,
    },
    limit: 50,
  });
  return NextResponse.json({ requests: rows });
}
