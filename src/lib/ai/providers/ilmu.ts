/**
 * ILMU — the configured provider.
 *
 * The shape below is deliberate; the endpoint paths, model names and response
 * fields marked TODO come from https://docs.ilmu.ai. Fill them in from the docs
 * rather than guessing — a wrong guess here fails silently into the fallback
 * path and looks like "AI just doesn't work".
 *
 * Before wiring this up, answer the two blocking questions in
 * docs/12_AI_INTEGRATION.md §"Before you write the integration":
 *   5. Is audio and prompt data retained, and can that be turned off?
 *   6. Where does inference run?
 * If retention can't be disabled, speech input does not ship.
 */

import type { AiProvider, AiResult, DraftRequest } from '../index';
import { sanitise, redactText } from '../guard';

const BASE = process.env.ILMU_BASE_URL ?? '';           // TODO: from the docs
const KEY = process.env.ILMU_API_KEY ?? '';
const TIMEOUT = Number(process.env.AI_TIMEOUT_MS ?? 6000);

async function call<T>(path: string, body: unknown): Promise<AiResult<T>> {
  if (!BASE || !KEY) return { ok: false, reason: 'unavailable' };

  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT);
  try {
    const res = await fetch(`${BASE}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${KEY}`,        // TODO: confirm header format
      },
      body: JSON.stringify(sanitise(body)),
      signal: ctrl.signal,
    });
    if (!res.ok) return { ok: false, reason: res.status === 429 ? 'over_budget' : 'unavailable' };
    return { ok: true, data: (await res.json()) as T };
  } catch (e) {
    return { ok: false, reason: (e as Error).name === 'AbortError' ? 'timeout' : 'unavailable' };
  } finally {
    clearTimeout(t);
  }
}

export const ilmu: AiProvider = {
  name: 'ilmu',

  /**
   * The highest-value feature in the product. An older user says
   * "saya nak pergi hospital hari Jumaat pagi, anak saya tak boleh ikut"
   * and gets a pre-filled form to confirm.
   *
   * Needs structured output (JSON mode or function calling) — check the docs.
   * Code-switching mid-sentence is the real test: Malay verb, English place
   * name, Tamil aside. That's where a Malaysian model should earn its place.
   */
  async transcribeToRequest(audio: Blob, locale: string): Promise<AiResult<DraftRequest>> {
    const form = new FormData();
    form.append('audio', audio);
    form.append('language', locale);
    // TODO: endpoint, model name, and the response field carrying the transcript
    return { ok: false, reason: 'unavailable' };
  },

  async speak(text: string, locale: string) {
    // TODO: TTS endpoint, voice per locale
    void text; void locale;
    return { ok: false, reason: 'unavailable' } as AiResult<ArrayBuffer>;
  },

  /** Callers must have already excluded safety strings — see isSafetyString(). */
  async draftTranslation(text: string, from: string, to: string) {
    return call<string>('/v1/translate', { text: redactText(text), from, to });
  },

  /** Returns flags for an admin queue. Never acts. */
  async triageContent(text: string, locale: string) {
    return call<{ flags: string[]; note: string }>('/v1/moderate', {
      text: redactText(text),
      locale,
      categories: ['money', 'dating', 'grooming', 'credentials', 'mlm', 'medical_advice'],
    });
  },

  async suggestCategory(text: string, locale: string) {
    return call<{ key: string; confidence: number }>('/v1/classify', {
      text: redactText(text), locale,
    });
  },

  async summariseIncident(timeline: unknown[]) {
    return call<string>('/v1/summarise', { timeline });
  },

  async answerFaq(question: string, locale: string) {
    return call<string>('/v1/answer', { question: redactText(question), locale });
  },
};
