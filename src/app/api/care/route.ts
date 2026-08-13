import { NextRequest, NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import { careRecipient } from '@/db/schema';
import { personIdFromSession } from '@/auth';
import { locales, type Locale } from '@/i18n';

const AGE_BANDS = ['under60', '60s', '70s', '80s', '90plus'] as const;
const ACCESS = ['wheelchair', 'slowWalking', 'restsOften', 'hearing', 'vision', 'noStairs'] as const;
const CONV = ['justListen', 'casualChat', 'adviceOkay', 'noAdvice'] as const;

type Body = {
  id?: string;
  preferredName?: string;
  relationship?: string;
  ageBand?: string;
  preferredLanguage?: string;
  mobilityNotes?: string;
  accessibility?: string[];
  conversationPrefs?: string[];
  emergencyContact?: { name?: string; phone?: string; relationship?: string };
};

/* Free-text notes only — NO structured medical fields, ever (docs/03 §17).
   The moment a conditions table exists, someone fills it in. */
function clean(body: Body) {
  return {
    preferredName: body.preferredName?.trim().slice(0, 60) || undefined,
    relationship: body.relationship?.trim().slice(0, 40) || null,
    ageBand: (AGE_BANDS as readonly string[]).includes(body.ageBand ?? '') ? body.ageBand : null,
    preferredLanguage: locales.includes(body.preferredLanguage as Locale)
      ? (body.preferredLanguage as Locale)
      : undefined,
    mobilityNotes: body.mobilityNotes?.trim().slice(0, 400) || null,
    accessibility: body.accessibility?.filter((a) => (ACCESS as readonly string[]).includes(a)) ?? [],
    conversationPrefs: body.conversationPrefs?.filter((c) => (CONV as readonly string[]).includes(c)) ?? [],
    emergencyContact: body.emergencyContact?.name && body.emergencyContact?.phone
      ? {
          name: String(body.emergencyContact.name).slice(0, 60),
          phone: String(body.emergencyContact.phone).slice(0, 20),
          relationship: String(body.emergencyContact.relationship ?? '').slice(0, 40),
        }
      : null,
  };
}

export async function POST(req: NextRequest) {
  const personId = await personIdFromSession();
  if (!personId) return NextResponse.json({ ok: false }, { status: 401 });

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const c = clean(body);

  if (body.id) {
    /* owner-scoped update — never trust the id alone */
    const existing = await db.query.careRecipient.findFirst({
      where: and(eq(careRecipient.id, body.id), eq(careRecipient.managedBy, personId)),
    });
    if (!existing) return NextResponse.json({ ok: false }, { status: 404 });
    await db.update(careRecipient).set({
      ...(c.preferredName ? { preferredName: c.preferredName } : {}),
      ...(c.preferredLanguage ? { preferredLanguage: c.preferredLanguage } : {}),
      relationship: c.relationship,
      ageBand: c.ageBand,
      mobilityNotes: c.mobilityNotes,
      accessibility: c.accessibility,
      conversationPrefs: c.conversationPrefs,
      emergencyContact: c.emergencyContact,
    }).where(eq(careRecipient.id, body.id));
    return NextResponse.json({ ok: true, id: body.id });
  }

  if (!c.preferredName || !c.preferredLanguage) {
    return NextResponse.json({ ok: false, reason: 'incomplete' }, { status: 400 });
  }
  const [row] = await db.insert(careRecipient).values({
    managedBy: personId,
    preferredName: c.preferredName,
    preferredLanguage: c.preferredLanguage,
    relationship: c.relationship,
    ageBand: c.ageBand,
    mobilityNotes: c.mobilityNotes,
    accessibility: c.accessibility,
    conversationPrefs: c.conversationPrefs,
    emergencyContact: c.emergencyContact,
  }).returning({ id: careRecipient.id });
  return NextResponse.json({ ok: true, id: row.id });
}
