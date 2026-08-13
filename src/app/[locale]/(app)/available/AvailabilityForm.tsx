'use client';

import { useState } from 'react';
import { useLocale, useTranslations, useFormatter } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { RadioCards } from '@/components/RadioCards';
import { Chips } from '@/components/Chips';
import { DayPicker } from '@/components/DayPicker';
import { Calendar } from '@/components/Calendar';
import { Select } from '@/components/Select';
import { Stepper } from '@/components/Stepper';
import { Switch } from '@/components/Switch';

type Cat = { id: string; name: string };
const TRANSPORT_OPTIONS = ['car', 'canDrive', 'publicTransport', 'meetThere'];

export type SlotInitial = {
  id?: string;
  date?: string;
  from?: string;
  until?: string;
  radius?: 'walking' | 'area' | 'city';
  categories?: string[];
  transport?: string[];
  repeatsWeekly?: boolean;
};

const HOURS = Array.from({ length: 15 }, (_, i) => {
  const h = i + 7; // 07:00 … 21:00
  return `${String(h).padStart(2, '0')}:00`;
});

/* F1/F2 · Declare free time: when → where → what → transport, then a review
   that reflects the setting back in words — "requests within about 5 km of
   your area", never "radius: 5000 m". Radius is three named choices; sliders
   and unsteady hands don't mix. */
export function AvailabilityForm({ initial, areaName, cats }: {
  initial?: SlotInitial;
  areaName: string;
  cats: Cat[];
}) {
  const t = useTranslations('avail');
  const locale = useLocale();
  const format = useFormatter();
  const router = useRouter();

  const todayIso = new Date().toISOString().slice(0, 10);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [date, setDate] = useState(initial?.date ?? todayIso);
  const [showCal, setShowCal] = useState(false);
  const [from, setFrom] = useState(initial?.from ?? '14:00');
  const [until, setUntil] = useState(initial?.until ?? '18:00');
  const [radius, setRadius] = useState<'walking' | 'area' | 'city' | null>(initial?.radius ?? null);
  const [categories, setCategories] = useState<string[]>(initial?.categories ?? []);
  const [transport, setTransport] = useState<string[]>(initial?.transport ?? []);
  const [repeatsWeekly, setRepeatsWeekly] = useState(initial?.repeatsWeekly ?? false);
  const [busy, setBusy] = useState(false);

  const iso = (offset: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return d.toISOString().slice(0, 10);
  };

  async function save() {
    setBusy(true);
    const res = await fetch('/api/availability', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: initial?.id, date, from, until, radius, categories, transport, repeatsWeekly }),
    });
    setBusy(false);
    if (res.ok) router.push(`/${locale}/available`);
  }

  if (step === 1) {
    return (
      <div style={{ display: 'grid', gap: 'var(--s-4)' }}>
        <Stepper current={1} total={4} />
        <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.3em', margin: 0 }}>{t('whenTitle')}</h2>
        <DayPicker
          days={[iso(0), iso(1), iso(2)]}
          value={date}
          onChange={(d) => { setDate(d); setShowCal(false); }}
          moreLabel={t('moreDays')}
          onMore={() => setShowCal(true)}
        />
        {showCal && (
          <Calendar month={`${todayIso.slice(0, 7)}-01`} selected={date} onSelect={(d) => setDate(d)} />
        )}
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
        <Button disabled={until <= from} onClick={() => setStep(2)}>{t('next')}</Button>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div style={{ display: 'grid', gap: 'var(--s-4)' }}>
        <Stepper current={2} total={4} />
        <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.3em', margin: 0 }}>{t('whereTitle')}</h2>
        <p style={{ color: 'var(--n-700)', margin: 0 }}>{t('startingFrom', { area: areaName })}</p>
        <RadioCards
          value={radius}
          onChange={setRadius}
          options={[
            { value: 'walking', label: t('radius.walking'), description: t('radiusSub.walking') },
            { value: 'area', label: t('radius.area'), description: t('radiusSub.area') },
            { value: 'city', label: t('radius.city'), description: t('radiusSub.city') },
          ]}
        />
        <Button disabled={!radius} onClick={() => setStep(3)}>{t('next')}</Button>
        <Button variant="ghost" size="md" onClick={() => setStep(1)}>{t('back')}</Button>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div style={{ display: 'grid', gap: 'var(--s-4)' }}>
        <Stepper current={3} total={4} />
        <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.3em', margin: 0 }}>{t('whatTitle')}</h2>
        <p style={{ color: 'var(--n-700)', margin: 0 }}>{t('whatHint')}</p>
        <Chips
          label={t('whatTitle')}
          options={cats.map((c) => ({ value: c.id, label: c.name }))}
          selected={categories}
          onChange={setCategories}
        />
        <h2 className="label" style={{ margin: 0, color: 'var(--n-700)' }}>{t('transportTitle')}</h2>
        <Chips
          label={t('transportTitle')}
          options={TRANSPORT_OPTIONS.map((o) => ({ value: o, label: t(`transport.${o}` as never) }))}
          selected={transport}
          onChange={setTransport}
        />
        <Button onClick={() => setStep(4)}>{t('next')}</Button>
        <Button variant="ghost" size="md" onClick={() => setStep(2)}>{t('back')}</Button>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gap: 'var(--s-4)' }}>
      <Stepper current={4} total={4} />
      <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.3em', margin: 0 }}>{t('reviewTitle')}</h2>
      <div className="card" style={{ borderInlineStart: '4px solid var(--t-900)' }}>
        <p className="card-title">
          {format.dateTime(new Date(`${date}T12:00:00`), { weekday: 'long', day: 'numeric', month: 'long' })}
          {' · '}{from}–{until}
        </p>
        {/* the reflection-in-words that makes "5000 m" mean something */}
        <p className="card-meta" style={{ margin: 0 }}>
          {t(`reviewWords.${radius}`, { area: areaName, count: categories.length })}
        </p>
      </div>
      <Switch
        title={t('repeatTitle')}
        sub={t('repeatSub')}
        checked={repeatsWeekly}
        onChange={setRepeatsWeekly}
      />
      <Button loading={busy} onClick={save}>{t('saveCta')}</Button>
      <Button variant="ghost" size="md" onClick={() => setStep(3)}>{t('back')}</Button>
      <p className="field-hint" style={{ margin: 0 }}>{t('nobodyContacts')}</p>
    </div>
  );
}
