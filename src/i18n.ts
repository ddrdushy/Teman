/**
 * Four languages, from day one.
 *
 * Every user-visible string is a key. No component contains literal English.
 * This is unenforceable retroactively — hardcode strings "just for now" and you
 * will spend a month extracting them later.
 */

import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

export const locales = ['en', 'ms', 'ta', 'zh'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

/** Always shown in its own script, in this order, never translated, no flags.
 *  A flag names a country, not a language — Malaysian Tamil speakers are
 *  Malaysian, and people scan this list for a shape they recognise, so the
 *  order must never change. */
export const localeNames: Record<Locale, { own: string; en: string }> = {
  en: { own: 'English',        en: 'English'  },
  ms: { own: 'Bahasa Melayu',  en: 'Malay'    },
  ta: { own: 'தமிழ்',           en: 'Tamil'    },
  zh: { own: '中文',            en: 'Chinese'  },
};

/** Per-script type metrics. Vollkorn covers neither Tamil nor Chinese, so the
 *  serif voice would otherwise fall back to whatever the OS picks. */
export const scriptMetrics: Record<Locale, { lineHeight: number; sizeBump: number }> = {
  en: { lineHeight: 1.55, sizeBump: 0 },
  ms: { lineHeight: 1.55, sizeBump: 0 },
  ta: { lineHeight: 1.75, sizeBump: 1 },   // conjuncts stack above and below the baseline
  zh: { lineHeight: 1.80, sizeBump: 0 },   // dense glyphs; never letter-space CJK
};

export default getRequestConfig(async ({ locale }) => {
  if (!locales.includes(locale as Locale)) notFound();
  return {
    messages: (await import(`./messages/${locale}.json`)).default,
    timeZone: 'Asia/Kuala_Lumpur',
    // Dates and times are formatted per locale, not string-swapped.
    // "Friday, 9:30 AM" is not "Jumaat, 9:30 pagi" by substitution.
    formats: {
      dateTime: {
        appointment: { weekday: 'long', day: 'numeric', month: 'long', hour: 'numeric', minute: '2-digit' },
        short:       { day: 'numeric', month: 'short' },
      },
    },
  };
});
