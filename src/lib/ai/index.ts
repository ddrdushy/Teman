/**
 * The AI interface. Product code imports from here and nowhere else, so
 * swapping providers is a config change.
 *
 * Every method may return { ok: false }. That is the normal case, not an
 * exception — every caller has a non-AI path and must use it. See
 * docs/12_AI_INTEGRATION.md.
 */

import { sanitise } from './guard';
import { ilmu } from './providers/ilmu';
import { nullProvider } from './providers/null';

export type AiResult<T> =
  | { ok: true; data: T }
  | { ok: false; reason: 'unavailable' | 'timeout' | 'refused' | 'over_budget' };

/** Speech → the fields of a request. Never auto-submitted; the user confirms. */
export type DraftRequest = {
  categoryKey?: string;
  beneficiaryHint?: string;      // "my father" — mapped to a recipient by the UI, not here
  destinationText?: string;
  whenText?: string;
  descriptionText?: string;
  languageHints?: string[];
  confidence: number;            // below 0.6 the UI shows the plain form instead
};

export interface AiProvider {
  readonly name: string;
  transcribeToRequest(audio: Blob, locale: string): Promise<AiResult<DraftRequest>>;
  speak(text: string, locale: string): Promise<AiResult<ArrayBuffer>>;
  draftTranslation(text: string, from: string, to: string): Promise<AiResult<string>>;
  triageContent(text: string, locale: string): Promise<AiResult<{ flags: string[]; note: string }>>;
  suggestCategory(text: string, locale: string): Promise<AiResult<{ key: string; confidence: number }>>;
  summariseIncident(timeline: unknown[]): Promise<AiResult<string>>;
  answerFaq(question: string, locale: string): Promise<AiResult<string>>;
}

const provider: AiProvider =
  process.env.AI_PROVIDER === 'ilmu' ? ilmu : nullProvider;

/* ── Public surface. Each one sanitises, times out, and degrades. ────────── */

export const ai = {
  available: () => provider.name !== 'none',

  async transcribeToRequest(audio: Blob, locale: string) {
    return provider.transcribeToRequest(audio, locale);
  },

  async speak(text: string, locale: string) {
    return provider.speak(text, locale);
  },

  /** Safety strings never pass through here — they're human-written and
   *  NGO-signed-off. Callers must filter by key before calling. */
  async draftTranslation(text: string, from: string, to: string) {
    return provider.draftTranslation(text, from, to);
  },

  /** Flags only. Never suspends, rejects or removes anything. */
  async triageContent(text: string, locale: string) {
    return provider.triageContent(text, locale);
  },

  async suggestCategory(text: string, locale: string) {
    return provider.suggestCategory(text, locale);
  },

  async summariseIncident(timeline: unknown[]) {
    return provider.summariseIncident(sanitise(timeline));
  },

  async answerFaq(question: string, locale: string) {
    return provider.answerFaq(question, locale);
  },
};

export const SAFETY_STRING_PREFIXES = [
  'session.notEmergency', 'session.safetyHelp',
  'safety.', 'consent.', 'report.', 'emotional.',
];

/** Safety copy is human-translated and signed off by the NGO. A wrong word
 *  in an emergency notice is a real-world harm, so it never reaches a model —
 *  not even for a first draft. */
export function isSafetyString(key: string): boolean {
  return SAFETY_STRING_PREFIXES.some((p) => key.startsWith(p));
}
