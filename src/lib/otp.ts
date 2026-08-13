/**
 * Phone OTP.
 *
 * Two design tensions, resolved deliberately:
 *
 *  - An unprotected OTP endpoint is a direct route to a bill. Rate limits are
 *    not optional and they belong here, not in config.
 *  - The audience will misread digits. Ten-minute validity and unlimited
 *    attempts within it are correct. Making this stricter "for security" just
 *    locks out the exact people the product exists for.
 */

import { randomInt, createHash, timingSafeEqual } from 'node:crypto';

export const OTP_TTL_MS = 10 * 60 * 1000;      // generous on purpose
export const RESEND_COOLDOWN_MS = 30 * 1000;
export const DEVICE_TRUST_DAYS = 90;           // returning users don't re-OTP

const LIMITS = {
  perNumberPerHour: 3,
  perIpPerHour: 10,
  backoffMs: [0, 60_000, 300_000, 900_000],    // 0 · 1m · 5m · 15m
};

export function generateOtp(): string {
  // Demo environment only. Gated by an env flag that must be absent in prod.
  if (process.env.DEMO_MODE === 'true' && process.env.DEMO_OTP) {
    return process.env.DEMO_OTP;
  }
  return String(randomInt(0, 1_000_000)).padStart(6, '0');
}

export function hashOtp(otp: string, salt: string): string {
  return createHash('sha256').update(`${salt}:${otp}`).digest('hex');
}

export function verifyOtp(input: string, storedHash: string, salt: string): boolean {
  const a = Buffer.from(hashOtp(input, salt));
  const b = Buffer.from(storedHash);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function backoffFor(attempts: number): number {
  return LIMITS.backoffMs[Math.min(attempts, LIMITS.backoffMs.length - 1)];
}

/** Malaysian numbers. Accept what people actually type; normalise internally. */
export function normaliseMyPhone(raw: string): string | null {
  const d = raw.replace(/\D/g, '');
  if (d.startsWith('60') && d.length >= 11 && d.length <= 12) return `+${d}`;
  if (d.startsWith('0')  && d.length >= 10 && d.length <= 11) return `+60${d.slice(1)}`;
  if (d.length >= 9 && d.length <= 10)                        return `+60${d}`;
  return null;
}

export { LIMITS };
