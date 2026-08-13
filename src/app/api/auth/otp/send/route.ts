import { NextRequest, NextResponse } from 'next/server';
import { createChallenge } from '@/lib/auth-otp';
import { sendSms, otpSmsBody } from '@/lib/sms';
import { locales, defaultLocale, type Locale } from '@/i18n';

export async function POST(req: NextRequest) {
  let body: { phone?: string; locale?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, reason: 'invalid_phone' }, { status: 400 });
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null;
  const result = await createChallenge(body.phone ?? '', ip);

  if (!result.ok) {
    const status = result.reason === 'invalid_phone' ? 400 : 429;
    return NextResponse.json(
      { ok: false, reason: result.reason, retryAfterMs: result.retryAfterMs },
      { status },
    );
  }

  const locale: Locale = locales.includes(body.locale as Locale)
    ? (body.locale as Locale)
    : defaultLocale;
  await sendSms(result.phone!, await otpSmsBody(locale, result.code!));

  /* The code itself never leaves the server. */
  return NextResponse.json({ ok: true, resendAfterMs: result.resendAfterMs });
}
