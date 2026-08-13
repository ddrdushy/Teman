'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { TextSizeControl } from '@/components/TextSizeControl';
import { Switch } from '@/components/Switch';
import { Button } from '@/components/Button';
import { LanguageSheet } from '@/components/LanguageSheet';

export function SettingsForm({ textScale, isElderView }: { textScale: number; isElderView: boolean }) {
  const t = useTranslations();
  const router = useRouter();
  const [langOpen, setLangOpen] = useState(false);
  const [elder, setElder] = useState(isElderView);

  async function toggleElder(next: boolean) {
    setElder(next);
    await fetch('/api/me/preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isElderView: next }),
    });
    router.refresh();
  }

  return (
    <div className="stack">
      <Button variant="ghost" size="md" onClick={() => setLangOpen(true)}>
        🌐 {t('language.choose')}
      </Button>
      <LanguageSheet open={langOpen} onClose={() => setLangOpen(false)} />

      <h2 className="label" style={{ margin: 'var(--s-2) 0 0' }}>{t('language.textSize')}</h2>
      <TextSizeControl current={textScale} />

      {/* Elder view defaults text to Large and strips home to three actions.
          Switchable any time (A-07). */}
      <Switch
        title={t('you.elderView')}
        sub={t('you.elderViewSub')}
        checked={elder}
        onChange={toggleElder}
      />
    </div>
  );
}
