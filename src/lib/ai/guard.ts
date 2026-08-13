/**
 * The one place where "this data never leaves" is enforced.
 *
 * Every call into a model goes through sanitise() first. If a second path
 * appears that skips it, that is the bug — the same discipline as
 * lib/privacy.ts and exactPoint.
 */

export class AiDataError extends Error {
  constructor(msg: string) { super(msg); this.name = 'AiDataError'; }
}

/** Never sent to a model, in any feature, for any reason. */
const FORBIDDEN_KEYS = [
  'phoneE164', 'phone', 'email',
  'exactPoint', 'exactAddress', 'approxPoint', 'centrePoint',
  'docKey', 'docHash', 'selfieKey', 'photoKey',
  'emergencyContact', 'mobilityNotes',
  'feltSafe', 'wouldMeetAgain', 'privateNote',
  'password', 'otp', 'token', 'apiKey',
] as const;

/* Patterns that can survive in free text even when the field itself was
   stripped — someone typing their IC into a description box, for instance. */
const PATTERNS: Array<[RegExp, string]> = [
  [/\b\d{6}-\d{2}-\d{4}\b/g, '[id-removed]'],              // MyKad
  [/\b(?:\+?60|0)1\d[-\s]?\d{3,4}[-\s]?\d{4}\b/g, '[phone-removed]'],
  [/\b[\w.+-]+@[\w-]+\.[\w.]{2,}\b/g, '[email-removed]'],
  [/\b\d{10,16}\b/g, '[number-removed]'],                   // long account-like numbers
];

export function redactText(input: string): string {
  return PATTERNS.reduce((s, [re, rep]) => s.replace(re, rep), input);
}

/**
 * Strips forbidden fields recursively and redacts free text.
 * Throws rather than silently dropping when a forbidden key holds a value —
 * a silent drop hides a caller that shouldn't have been written that way.
 */
export function sanitise<T>(payload: T, opts: { strict?: boolean } = {}): T {
  const strict = opts.strict ?? true;

  const walk = (v: unknown, path: string): unknown => {
    if (typeof v === 'string') return redactText(v);
    if (Array.isArray(v)) return v.map((x, i) => walk(x, `${path}[${i}]`));
    if (v && typeof v === 'object') {
      const out: Record<string, unknown> = {};
      for (const [k, val] of Object.entries(v)) {
        if ((FORBIDDEN_KEYS as readonly string[]).includes(k)) {
          if (strict && val != null) {
            throw new AiDataError(`refusing to send "${k}" to a model (at ${path || 'root'})`);
          }
          continue;
        }
        out[k] = walk(val, path ? `${path}.${k}` : k);
      }
      return out;
    }
    return v;
  };

  return walk(payload, '') as T;
}

/** Names are reduced before they're sent — first name only, never full. */
export function firstNameOnly(displayName: string): string {
  return displayName.trim().split(/\s+/)[0] ?? '';
}
