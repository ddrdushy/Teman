'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { LanguageSheet } from '@/components/LanguageSheet';

/* The language control lives at the bottom of home, in the same place
   forever — findable by someone who cannot read the current language. */
export function HomeBar({ inline = false }: { inline?: boolean }) {
  const t = useTranslations('language');
  const [open, setOpen] = useState(false);

  return (
    <div
      style={inline
        ? { marginTop: 'var(--tap-gap)' }
        : {
            position: 'sticky', bottom: 0, margin: '0 calc(-1 * var(--s-5))',
            padding: 'var(--s-3) var(--s-5) var(--s-4)',
            background: 'var(--n-050)', borderTop: '1px solid var(--n-200)',
          }}
    >
      <button className="btn btn-ghost" style={{ minHeight: 'var(--tap-min)' }} onClick={() => setOpen(true)}>
        🌐 {t('control')}
      </button>
      <LanguageSheet open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
