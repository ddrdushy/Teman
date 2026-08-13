'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { Stepper } from '@/components/Stepper';
import { Skeleton } from '@/components/Skeleton';
import { EmptyState } from '@/components/EmptyState';

type AreaRow = { id: string; name: string; nameMs: string | null; nameTa: string | null; nameZh: string | null };

export function AreaStep() {
  const t = useTranslations('join');
  const locale = useLocale();
  const router = useRouter();
  const [q, setQ] = useState('');
  const [areas, setAreas] = useState<AreaRow[] | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const ctl = new AbortController();
    fetch(`/api/areas?q=${encodeURIComponent(q)}`, { signal: ctl.signal })
      .then((r) => r.json())
      .then((d) => setAreas(d.areas))
      .catch(() => {});
    return () => ctl.abort();
  }, [q]);

  function localName(a: AreaRow): string {
    const n = locale === 'ms' ? a.nameMs : locale === 'ta' ? a.nameTa : locale === 'zh' ? a.nameZh : a.name;
    return n ?? a.name;
  }

  async function save() {
    if (!picked) return;
    setBusy(true);
    const res = await fetch('/api/join/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ areaId: picked }),
    });
    setBusy(false);
    if (res.ok) router.push(`/${locale}/join/done`);
  }

  return (
    <main className="screen-pad" style={{ display: 'grid', gap: 'var(--s-5)' }}>
      <Stepper current={4} total={4} />
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.5em', margin: 0 }}>{t('areaTitle')}</h1>
      <TextField
        label={t('areaSearchLabel')}
        hint={t('areaHint')}
        value={q}
        onChange={(e) => setQ((e.target as HTMLInputElement).value)}
      />
      {areas === null ? (
        <Skeleton lines={4} />
      ) : areas.length === 0 ? (
        <EmptyState illustration="none" title={t('areaNoneTitle')} body={t('areaNoneBody')} />
      ) : (
        <div className="stack" role="radiogroup" aria-label={t('areaTitle')}>
          {areas.map((a) => (
            <button
              key={a.id}
              role="radio"
              aria-checked={picked === a.id}
              className={['option-row', picked === a.id ? 'is-selected' : ''].join(' ').trim()}
              onClick={() => setPicked(a.id)}
            >
              <span>
                <span style={{ fontWeight: 600 }}>{localName(a)}</span>
                {localName(a) !== a.name && <span className="or-sub">{a.name}</span>}
              </span>
              <span className="or-tick" aria-hidden="true">✓</span>
            </button>
          ))}
        </div>
      )}
      <Button loading={busy} disabled={!picked} onClick={save}>{t('continueLabel')}</Button>
    </main>
  );
}
