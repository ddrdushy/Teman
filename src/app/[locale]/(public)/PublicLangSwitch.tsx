'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { LanguageSheet } from '@/components/LanguageSheet';

export function PublicLangSwitch() {
  const t = useTranslations('language');
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="btn btn-line" style={{ width: 'auto', minHeight: 'var(--tap-min)', fontSize: '0.85em' }}
        onClick={() => setOpen(true)}>
        🌐 {t('choose')}
      </button>
      <LanguageSheet open={open} onClose={() => setOpen(false)} />
    </>
  );
}
