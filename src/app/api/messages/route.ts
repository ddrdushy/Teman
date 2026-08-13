import { NextRequest, NextResponse } from 'next/server';
import { and, asc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { request, match, message } from '@/db/schema';
import { personIdFromSession } from '@/auth';

/** G-04 · Messaging is scoped to a matched request and its two parties.
 *  Not a general chat platform — there is deliberately no other thread kind. */
async function participants(requestId: string) {
  const r = await db.query.request.findFirst({ where: eq(request.id, requestId) });
  if (!r) return null;
  const m = await db.query.match.findFirst({ where: eq(match.requestId, requestId) });
  if (!m) return null;
  return { requesterId: r.requesterId, temanId: m.temanId, title: r.title };
}

export async function GET(req: NextRequest) {
  const personId = await personIdFromSession();
  if (!personId) return NextResponse.json({ ok: false }, { status: 401 });
  const requestId = new URL(req.url).searchParams.get('requestId');
  if (!requestId) return NextResponse.json({ ok: false }, { status: 400 });

  const p = await participants(requestId);
  if (!p || (personId !== p.requesterId && personId !== p.temanId)) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  const rows = await db.query.message.findMany({
    where: eq(message.requestId, requestId),
    orderBy: asc(message.createdAt),
    limit: 200,
  });
  await db.update(message)
    .set({ readAt: new Date() })
    .where(and(eq(message.requestId, requestId), eq(message.senderId, personId === p.requesterId ? p.temanId : p.requesterId)));

  return NextResponse.json({
    messages: rows.map((m) => ({
      id: m.id, mine: m.senderId === personId, body: m.body, at: m.createdAt,
    })),
  });
}

export async function POST(req: NextRequest) {
  const personId = await personIdFromSession();
  if (!personId) return NextResponse.json({ ok: false }, { status: 401 });

  let b: { requestId?: string; body?: string };
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const body = b.body?.trim().slice(0, 1000);
  if (!b.requestId || !body) return NextResponse.json({ ok: false }, { status: 400 });

  const p = await participants(b.requestId);
  if (!p || (personId !== p.requesterId && personId !== p.temanId)) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  await db.insert(message).values({ requestId: b.requestId, senderId: personId, body });
  return NextResponse.json({ ok: true });
}
