/**
 * Content triage. Flags, never acts — output lands in the N15 admin queue
 * and a person decides (docs/12 §4). The keyword rules ARE the
 * AI_PROVIDER=none path; when a provider is configured, ai.triageContent()
 * runs first and these rules remain the fallback.
 */

import { ai } from '@/lib/ai';

const KEYWORD_FLAGS: Array<[RegExp, string]> = [
  [/\b(cash|money|wang|duit|loan|pinjam|bayar|payment|rm\s?\d)/i, 'money'],
  [/\b(date|dating|romance|romantic|girlfriend|boyfriend|awek|jodoh|pretty lady|nice lady|handsome)/i, 'dating'],
  [/\b(otp|password|pin\b|bank\s?account|tac\b)/i, 'credentials'],
  [/\b(invest|investment|crypto|forex|skim|scheme|mlm)/i, 'mlm'],
];

/** Returns flag names, or [] when clean. Never throws, never blocks. */
export async function triageText(text: string, locale: string): Promise<string[]> {
  const viaAi = await ai.triageContent(text, locale);
  if (viaAi.ok && viaAi.data.flags.length) return viaAi.data.flags;

  const flags = new Set<string>();
  for (const [re, flag] of KEYWORD_FLAGS) {
    if (re.test(text)) flags.add(flag);
  }
  return [...flags];
}
