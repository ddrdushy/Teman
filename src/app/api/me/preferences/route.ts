import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { person } from '@/db/schema';
import { personIdFromSession } from '@/auth';
import { locales, type Locale } from '@/i18n';

const TEXT_SCALES = [18, 22, 26] as const;

/* Language and text size live on the account, not the device (docs/03
   decision 3). The cookie is only the pre-auth / pre-hydration fallback. */
export async function POST(req: NextRequest) {
  const personId = await personIdFromSession();

  let body: { language?: string; textScale?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const language = locales.includes(body.language as Locale)
    ? (body.language as Locale)
    : undefined;
  const textScale = TEXT_SCALES.includes(body.textScale as (typeof TEXT_SCALES)[number])
    ? (body.textScale as (typeof TEXT_SCALES)[number])
    : undefined;
  if (!language && !textScale) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (personId) {
    await db.update(person)
      .set({
        ...(language ? { preferredLanguage: language } : {}),
        ...(textScale ? { textScale } : {}),
        updatedAt: new Date(),
      })
      .where(eq(person.id, personId));
  }

  const res = NextResponse.json({ ok: true, persisted: Boolean(personId) });
  if (textScale) {
    res.cookies.set('text-scale', String(textScale), {
      maxAge: 90 * 24 * 60 * 60,
      sameSite: 'lax',
    });
  }
  if (language) {
    res.cookies.set('preferred-language', language, {
      maxAge: 90 * 24 * 60 * 60,
      sameSite: 'lax',
    });
  }
  return res;
}
