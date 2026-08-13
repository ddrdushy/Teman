/**
 * Used in tests, and whenever AI_PROVIDER is unset.
 *
 * Running the whole product against this provider is the check that every AI
 * feature is genuinely optional. If something breaks with AI off, that feature
 * became load-bearing — a design error, not an outage.
 */

import type { AiProvider, AiResult } from '../index';

const off = <T>(): AiResult<T> => ({ ok: false, reason: 'unavailable' });

export const nullProvider: AiProvider = {
  name: 'none',
  async transcribeToRequest() { return off(); },
  async speak() { return off(); },
  async draftTranslation() { return off(); },
  async triageContent() { return off(); },
  async suggestCategory() { return off(); },
  async summariseIncident() { return off(); },
  async answerFaq() { return off(); },
};
