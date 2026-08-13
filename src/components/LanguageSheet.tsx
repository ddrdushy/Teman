'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Sheet } from './Sheet';
import { locales, localeNames, type Locale } from '@/i18n';

/** The most important small component in the product. Four options, fixed
 *  order forever, each in its own script — never translated, never reordered,
 *  no flags. A person looking for தமிழ் scans for the shape they recognise. */
export function LanguageSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useTranslations('language');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  async function pick(l: Locale) {
    /* Persists to the account (cookie fallback signed out), then re-renders
       font family, line-height, size bump and lang together via the layout. */
    await fetch('/api/me/preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language: l }),
    });
    const rest = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, '');
    onClose();
    router.push(`/${l}${rest || ''}`);
    router.refresh();
  }

  return (
    <Sheet title={t('choose')} open={open} onClose={onClose}>
      <p className="field-hint" style={{ marginBottom: 'var(--s-3)' }}>{t('hint')}</p>
      <div className="stack">
        {locales.map((l) => (
          <button
            key={l}
            lang={l}
            className={['option-row', l === locale ? 'is-selected' : ''].join(' ').trim()}
            onClick={() => pick(l)}
          >
            <span>
              <span className="or-own">{localeNames[l].own}</span>
              <span className="or-sub">{localeNames[l].en}</span>
            </span>
            <span className="or-tick" aria-hidden="true">✓</span>
          </button>
        ))}
      </div>
    </Sheet>
  );
}
