import { NextRequest, NextResponse } from 'next/server';
import { personIdFromSession } from '@/auth';
import { ai } from '@/lib/ai';

/* Speech → the fields of a request (docs/12 §1 — the big one). NEVER
 * auto-submits: the caller shows a filled form the person confirms. With
 * AI_PROVIDER=none this returns unavailable and the UI never shows the
 * button — the seven steps are always right there. Audio is forwarded,
 * never stored here. */
export async function POST(req: NextRequest) {
  const personId = await personIdFromSession();
  if (!personId) return NextResponse.json({ ok: false }, { status: 401 });

  if (!ai.available()) {
    return NextResponse.json({ ok: false, reason: 'unavailable' }, { status: 503 });
  }
  const form = await req.formData();
  const audio = form.get('audio');
  const locale = String(form.get('locale') ?? 'en');
  if (!(audio instanceof File) || audio.size === 0 || audio.size > 15 * 1024 * 1024) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const result = await ai.transcribeToRequest(audio, locale);
  if (!result.ok) return NextResponse.json(result, { status: 503 });
  return NextResponse.json(result);
}
