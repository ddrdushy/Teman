/**
 * OTP storage and verification against otp_challenge.
 *
 * The design tensions are resolved in lib/otp.ts and docs/04: rate limits are
 * strict (an open endpoint is a bill), validity is generous (the audience
 * misreads digits, and strictness locks out exactly the people the product
 * exists for). Unlimited attempts within the 10-minute window.
 */

import { randomBytes } from 'node:crypto';
import { and, count, desc, eq, gt, gte, isNull } from 'drizzle-orm';
import { db } from '@/db';
import { otpChallenge, person } from '@/db/schema';
import {
  generateOtp, hashOtp, verifyOtp, normaliseMyPhone,
  LIMITS, OTP_TTL_MS, RESEND_COOLDOWN_MS,
} from '@/lib/otp';

type SendResult =
  | { ok: true; resendAfterMs: number }
  | { ok: false; reason: 'invalid_phone' | 'rate_limited'; retryAfterMs?: number };

export async function createChallenge(rawPhone: string, ip: string | null): Promise<
  SendResult & { phone?: string; code?: string }
> {
  const phone = normaliseMyPhone(rawPhone);
  if (!phone) return { ok: false, reason: 'invalid_phone' };

  const hourAgo = new Date(Date.now() - 60 * 60 * 1000);

  const [byPhone] = await db.select({ n: count() }).from(otpChallenge)
    .where(and(eq(otpChallenge.phoneE164, phone), gte(otpChallenge.createdAt, hourAgo)));
  if (byPhone.n >= LIMITS.perNumberPerHour) {
    return { ok: false, reason: 'rate_limited', retryAfterMs: 60 * 60 * 1000 };
  }

  if (ip) {
    const [byIp] = await db.select({ n: count() }).from(otpChallenge)
      .where(and(eq(otpChallenge.requestIp, ip), gte(otpChallenge.createdAt, hourAgo)));
    if (byIp.n >= LIMITS.perIpPerHour) {
      return { ok: false, reason: 'rate_limited', retryAfterMs: 60 * 60 * 1000 };
    }
  }

  const latest = await db.query.otpChallenge.findFirst({
    where: eq(otpChallenge.phoneE164, phone),
    orderBy: desc(otpChallenge.createdAt),
  });
  if (latest) {
    const since = Date.now() - latest.createdAt.getTime();
    if (since < RESEND_COOLDOWN_MS) {
      return { ok: false, reason: 'rate_limited', retryAfterMs: RESEND_COOLDOWN_MS - since };
    }
  }

  const code = generateOtp();
  const salt = randomBytes(16).toString('hex');
  await db.insert(otpChallenge).values({
    phoneE164: phone,
    codeHash: hashOtp(code, salt),
    salt,
    requestIp: ip,
    expiresAt: new Date(Date.now() + OTP_TTL_MS),
  });

  return { ok: true, resendAfterMs: RESEND_COOLDOWN_MS, phone, code };
}

/** Verify a code; on success upsert the person row and return it. */
export async function consumeChallenge(rawPhone: string, code: string) {
  const phone = normaliseMyPhone(rawPhone);
  if (!phone) return null;

  const challenge = await db.query.otpChallenge.findFirst({
    where: and(
      eq(otpChallenge.phoneE164, phone),
      isNull(otpChallenge.consumedAt),
      gt(otpChallenge.expiresAt, new Date()),
    ),
    orderBy: desc(otpChallenge.createdAt),
  });
  if (!challenge) return null;

  if (!verifyOtp(code, challenge.codeHash, challenge.salt)) {
    await db.update(otpChallenge)
      .set({ attempts: challenge.attempts + 1 })
      .where(eq(otpChallenge.id, challenge.id));
    return null;
  }

  await db.update(otpChallenge)
    .set({ consumedAt: new Date() })
    .where(eq(otpChallenge.id, challenge.id));

  const existing = await db.query.person.findFirst({ where: eq(person.phoneE164, phone) });
  if (existing) {
    if (existing.suspendedAt) return null;
    return existing;
  }

  /* displayName is collected at join step A5, after the OTP. Empty until then —
     the join flow treats an empty name as "onboarding incomplete". */
  const [created] = await db.insert(person).values({
    phoneE164: phone,
    phoneVerifiedAt: new Date(),
    displayName: '',
  }).returning();
  return created;
}
