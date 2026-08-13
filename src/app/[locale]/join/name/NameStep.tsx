'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { Stepper } from '@/components/Stepper';

export function NameStep({ initialName }: { initialName: string }) {
  const t = useTranslations('join');
  const locale = useLocale();
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [busy, setBusy] = useState(false);
  const [empty, setEmpty] = useState(false);

  async function save() {
    if (!name.trim()) { setEmpty(true); return; }
    setBusy(true);
    const res = await fetch('/api/join/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ displayName: name }),
    });
    setBusy(false);
    if (res.ok) router.push(`/${locale}/join/area`);
  }

  return (
    <main className="screen-pad" style={{ display: 'grid', gap: 'var(--s-5)' }}>
      <Stepper current={3} total={4} />
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.5em', margin: 0 }}>{t('nameTitle')}</h1>
      <TextField
        label={t('nameTitle')}
        hint={t('nameHint')}
        autoComplete="name"
        value={name}
        onChange={(e) => { setName((e.target as HTMLInputElement).value); setEmpty(false); }}
        error={empty ? t('nameEmpty') : undefined}
      />
      <Button loading={busy} onClick={save}>{t('continueLabel')}</Button>
    </main>
  );
}
