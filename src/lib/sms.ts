/**
 * One function in front of the SMS provider, per docs/01 §5 — Twilio or a
 * local Malaysian gateway swaps in behind it without touching callers.
 *
 * Without SMS_PROVIDER_KEY the message is logged, never sent. That is the dev
 * and demo behaviour; docs/10 requires SMS stubbed in the demo environment.
 */

export async function sendSms(toE164: string, body: string): Promise<void> {
  if (!process.env.SMS_PROVIDER_KEY) {
    console.log(`[sms:stub] ${toE164}: ${body}`);
    return;
  }
  // TODO(G2): wire the real provider chosen at deploy time behind this line.
  console.log(`[sms:unwired] provider key present but no provider configured`);
}

/** SMS copy comes from the message catalogues like every other string. */
export async function otpSmsBody(locale: string, code: string): Promise<string> {
  const messages = (await import(`@/messages/${locale}.json`)).default as {
    sms: { otp: string };
  };
  return messages.sms.otp.replace('{code}', code);
}
