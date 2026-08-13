import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { eq, inArray } from 'drizzle-orm';
import { db } from '@/db';
import { person, category } from '@/db/schema';
import { personIdFromSession } from '@/auth';
import { putObject } from '@/lib/storage';

const LANGS = ['ms', 'en', 'ta', 'zh-mandarin', 'zh-cantonese', 'hokkien', 'other'] as const;
const TRANSPORT = ['car', 'canDrive', 'publicTransport', 'accompanyYours', 'meetThere'] as const;
const MAX_PHOTO = 8 * 1024 * 1024;

/** C2/C3/C4/C5 all save through here. JSON for fields, multipart for the
 *  photo. Autosave semantics: partial updates, never a full-object PUT. */
export async function POST(req: NextRequest) {
  const personId = await personIdFromSession();
  if (!personId) return NextResponse.json({ ok: false }, { status: 401 });

  if (req.headers.get('content-type')?.includes('multipart/form-data')) {
    const form = await req.formData();
    const photo = form.get('photo');
    if (!(photo instanceof File) || photo.size === 0 || photo.size > MAX_PHOTO) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }
    const photoKey = `photo/${personId}/${randomUUID()}`;
    await putObject(photoKey, Buffer.from(await photo.arrayBuffer()), photo.type || 'image/jpeg');
    await db.update(person).set({ photoKey, updatedAt: new Date() }).where(eq(person.id, personId));
    return NextResponse.json({ ok: true, photoKey });
  }

  let body: { bio?: string; languages?: string[]; categories?: string[]; transport?: string[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const patch: Record<string, unknown> = {};
  if (typeof body.bio === 'string') patch.bio = body.bio.slice(0, 600);
  if (Array.isArray(body.languages)) {
    patch.languages = body.languages.filter((l) => (LANGS as readonly string[]).includes(l));
  }
  if (Array.isArray(body.transport)) {
    patch.transport = body.transport.filter((t) => (TRANSPORT as readonly string[]).includes(t));
  }
  if (Array.isArray(body.categories)) {
    const valid = await db.select({ id: category.id }).from(category)
      .where(inArray(category.id, body.categories.filter(Boolean)));
    patch.categories = valid.map((c) => c.id);
  }
  if (!Object.keys(patch).length) return NextResponse.json({ ok: false }, { status: 400 });

  await db.update(person).set({ ...patch, updatedAt: new Date() }).where(eq(person.id, personId));
  return NextResponse.json({ ok: true });
}
