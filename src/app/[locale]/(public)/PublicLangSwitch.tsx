'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { LanguageSheet } from '@/components/LanguageSheet';
import { localeNames, type Locale } from '@/i18n';

/* Compact in the bar — shows the language you're in, in its own writing.
   The full "choose your language" phrasing lives in the accessible name
   and inside the sheet itself. */
export function PublicLangSwitch() {
  const t = useTranslations('language');
  const locale = useLocale() as Locale;
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="btn btn-line" aria-label={t('choose')}
        style={{ width: 'auto', minHeight: 'var(--tap-min)', fontSize: '0.85em', whiteSpace: 'nowrap' }}
        onClick={() => setOpen(true)}>
        🌐 {localeNames[locale].own}
      </button>
      <LanguageSheet open={open} onClose={() => setOpen(false)} />
    </>
  );
}
