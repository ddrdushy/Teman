'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { DayPicker } from '@/components/DayPicker';
import { Select } from '@/components/Select';
import { Skeleton } from '@/components/Skeleton';
import { Banner } from '@/components/Banner';

type AreaRow = { id: string; name: string; nameMs: string | null; nameTa: string | null; nameZh: string | null };
const HOURS = Array.from({ length: 15 }, (_, i) => `${String(i + 7).padStart(2, '0')}:00`);

export function JourneyForm() {
  const t = useTranslations('journey');
  const locale = useLocale();
  const router = useRouter();
  const [q, setQ] = useState('');
  const [areas, setAreas] = useState<AreaRow[] | null>(null);
  const [destination, setDestination] = useState<string | null>(null);
  const todayIso = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(todayIso);
  const [from, setFrom] = useState('09:00');
  const [until, setUntil] = useState('11:00');
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const ctl = new AbortController();
    fetch(`/api/areas?q=${encodeURIComponent(q)}`, { signal: ctl.signal })
      .then((r) => r.json()).then((x) => setAreas(x.areas)).catch(() => {});
    return () => ctl.abort();
  }, [q]);

  const iso = (offset: number) => {
    const d = new Date(); d.setDate(d.getDate() + offset);
    return d.toISOString().slice(0, 10);
  };
  const localName = (a: AreaRow) =>
    (locale === 'ms' ? a.nameMs : locale === 'ta' ? a.nameTa : locale === 'zh' ? a.nameZh : a.name) ?? a.name;

  async function save() {
    setBusy(true);
    setFailed(false);
    const res = await fetch('/api/availability', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date, from, until, radius: 'city', destinationAreaId: destination,
      }),
    });
    setBusy(false);
    if (res.ok) {
      const { id } = await res.json();
      router.push(`/${locale}/journey/${id}`);
    } else setFailed(true);
  }

  return (
    <div style={{ display: 'grid', gap: 'var(--s-4)' }}>
      <TextField label={t('destLabel')} hint={t('destHint')} value={q}
        onChange={(e) => setQ((e.target as HTMLInputElement).value)} />
      {areas === null ? <Skeleton lines={3} /> : (
        <div className="stack" role="radiogroup" aria-label={t('destLabel')}>
          {areas.slice(0, 5).map((a) => (
            <button key={a.id} role="radio" aria-checked={destination === a.id}
              className={['option-row', destination === a.id ? 'is-selected' : ''].join(' ').trim()}
              onClick={() => setDestination(a.id)}>
              <span style={{ fontWeight: 600 }}>{localName(a)}</span>
              <span className="or-tick" aria-hidden="true">✓</span>
            </button>
          ))}
        </div>
      )}
      <DayPicker days={[iso(0), iso(1), iso(2)]} value={date} onChange={setDate}
        moreLabel={t('moreDays')} onMore={() => {}} />
      <div style={{ display: 'flex', gap: 'var(--tap-gap)' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Select label={t('fromLabel')} value={from} onChange={(e) => setFrom(e.target.value)}
            options={HOURS.map((h) => ({ value: h, label: h }))} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Select label={t('untilLabel')} value={until} onChange={(e) => setUntil(e.target.value)}
            options={HOURS.map((h) => ({ value: h, label: h }))} />
        </div>
      </div>
      {failed && <Banner variant="error">{t('saveFailed')}</Banner>}
      <Button loading={busy} disabled={!destination || until <= from} onClick={save}>
        {t('saveCta')}
      </Button>
      <p className="field-hint" style={{ margin: 0 }}>{t('notAutoMatched')}</p>
    </div>
  );
}
