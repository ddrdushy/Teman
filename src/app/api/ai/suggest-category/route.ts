import { NextRequest, NextResponse } from 'next/server';
import { personIdFromSession } from '@/auth';
import { ai } from '@/lib/ai';

/* Category suggestion (docs/12 §5): suggested, pre-selected, always
 * editable. Saves a step, decides nothing. none → 503, the grid stands. */
export async function POST(req: NextRequest) {
  const personId = await personIdFromSession();
  if (!personId) return NextResponse.json({ ok: false }, { status: 401 });
  if (!ai.available()) return NextResponse.json({ ok: false }, { status: 503 });

  let b: { text?: string; locale?: string };
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (!b.text?.trim()) return NextResponse.json({ ok: false }, { status: 400 });
  const result = await ai.suggestCategory(b.text, b.locale ?? 'en');
  if (!result.ok || result.data.confidence < 0.6) {
    return NextResponse.json({ ok: false }, { status: 503 });
  }
  return NextResponse.json(result);
}
