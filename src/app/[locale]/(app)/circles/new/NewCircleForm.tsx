'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { RadioCards } from '@/components/RadioCards';
import { Banner } from '@/components/Banner';

type AreaRow = { id: string; name: string };

export function NewCircleForm() {
  const t = useTranslations('community');
  const locale = useLocale();
  const router = useRouter();
  const [name, setName] = useState('');
  const [areas, setAreas] = useState<AreaRow[]>([]);
  const [areaId, setAreaId] = useState<string | null>(null);
  const [policy, setPolicy] = useState<'open' | 'approval'>('open');
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState(false);

  useEffect(() => {
    fetch('/api/areas').then((r) => r.json()).then((d) => setAreas(d.areas)).catch(() => {});
  }, []);

  async function create() {
    setBusy(true);
    const res = await fetch('/api/circles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create', name, areaId, joinPolicy: policy }),
    });
    setBusy(false);
    if (res.ok) setCreated(true);
  }

  if (created) {
    return (
      <div style={{ display: 'grid', gap: 'var(--s-3)' }}>
        <Banner variant="success" title={t('circleCreatedTitle')}>{t('circleCreatedBody')}</Banner>
        <Button variant="ghost" onClick={() => router.push(`/${locale}/circles`)}>{t('backToCircles')}</Button>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gap: 'var(--s-4)' }}>
      <TextField label={t('circleNameLabel')} value={name}
        onChange={(e) => setName((e.target as HTMLInputElement).value)} />
      <p className="label" style={{ color: 'var(--n-700)', margin: 0 }}>{t('circleAreaLabel')}</p>
      <div className="stack" role="radiogroup" aria-label={t('circleAreaLabel')}>
        {areas.slice(0, 6).map((a) => (
          <button key={a.id} role="radio" aria-checked={areaId === a.id}
            className={['option-row', areaId === a.id ? 'is-selected' : ''].join(' ').trim()}
            onClick={() => setAreaId(a.id)}>
            <span style={{ fontWeight: 600 }}>{a.name}</span>
            <span className="or-tick" aria-hidden="true">✓</span>
          </button>
        ))}
      </div>
      <RadioCards
        value={policy}
        onChange={setPolicy}
        options={[
          { value: 'open', label: t('policyOpen'), description: t('policyOpenSub') },
          { value: 'approval', label: t('policyApproval'), description: t('policyApprovalSub') },
        ]}
      />
      <Banner variant="info">{t('needsApproval')}</Banner>
      <Button loading={busy} disabled={!name.trim()} onClick={create}>{t('createCta')}</Button>
    </div>
  );
}
