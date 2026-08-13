'use client';

import { useRouter } from 'next/navigation';
import { locales, localeNames, type Locale } from '@/i18n';

/* Never translated, never reordered — people scan for the shape of their own
   script. Selection persists (account when signed in, cookie otherwise). */
export function LanguageCards() {
  const router = useRouter();

  async function pick(l: Locale) {
    await fetch('/api/me/preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language: l }),
    });
    router.push(`/${l}/welcome`);
  }

  return (
    <div className="stack">
      {locales.map((l) => (
        <button key={l} lang={l} className="option-row" onClick={() => pick(l)}>
          <span>
            <span className="or-own">{localeNames[l].own}</span>
            <span className="or-sub">{localeNames[l].en}</span>
          </span>
          <span className="or-tick" aria-hidden="true">›</span>
        </button>
      ))}
    </div>
  );
}
