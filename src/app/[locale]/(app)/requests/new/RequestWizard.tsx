'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations, useFormatter } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { RadioCards } from '@/components/RadioCards';
import { Chips } from '@/components/Chips';
import { DayPicker } from '@/components/DayPicker';
import { Calendar } from '@/components/Calendar';
import { Select } from '@/components/Select';
import { Counter } from '@/components/Counter';
import { Segmented } from '@/components/Segmented';
import { Switch } from '@/components/Switch';
import { Stepper } from '@/components/Stepper';
import { Banner } from '@/components/Banner';
import { Sisi } from '@/components/Sisi';
import { Skeleton } from '@/components/Skeleton';

type Recipient = { id: string; name: string; relationship: string | null; accessibility: string[] };
type Cat = { id: string; group: string; key: string; name: string };
type AreaRow = { id: string; name: string; nameMs: string | null; nameTa: string | null; nameZh: string | null };

const GROUPS = ['health', 'errands', 'elderly', 'emotional', 'social', 'welfare', 'digital'];
const MOODS = ['justListen', 'casualChat', 'walkTogether', 'coffeeMeal', 'quietCompany', 'adviceOkay', 'noAdvice'];
const DRAFT_KEY = 'teman-request-draft';

type Draft = {
  step: number;
  group: string | null;
  categoryId: string | null;
  beneficiary: string | null;   // 'self' | recipientId
  destinationText: string;
  areaId: string | null;
  exactAddress: string;
  whenType: 'asap' | 'today' | 'date' | null;
  date: string | null;
  time: string;
  durationMin: number;
  description: string;
  mood: string[];
  prefLangs: string[];
  gender: string;
  verifiedOnly: boolean;
  driving: boolean;
  visibility: 'public' | 'trusted_only';
};

const EMPTY: Draft = {
  step: 1, group: null, categoryId: null, beneficiary: null,
  destinationText: '', areaId: null, exactAddress: '',
  whenType: null, date: null, time: '09:00', durationMin: 120,
  description: '', mood: [], prefLangs: [], gender: 'any',
  verifiedOnly: false, driving: false, visibility: 'public',
};

const HOURS = Array.from({ length: 15 }, (_, i) => `${String(i + 7).padStart(2, '0')}:00`);

export function RequestWizard({ recipients, categories, defaultAreaId }: {
  recipients: Recipient[];
  categories: Cat[];
  defaultAreaId: string;
}) {
  const t = useTranslations('req');
  const tp = useTranslations('profile');
  const locale = useLocale();
  const format = useFormatter();
  const router = useRouter();

  const [d, setD] = useState<Draft>(EMPTY);
  const [hydrated, setHydrated] = useState(false);
  const [areas, setAreas] = useState<AreaRow[] | null>(null);
  const [areaQ, setAreaQ] = useState('');
  const [showCal, setShowCal] = useState(false);
  const [busy, setBusy] = useState(false);
  const [publishedId, setPublishedId] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  /* Autosave every change; resume on mount. A force-quit loses nothing. */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) setD({ ...EMPTY, ...JSON.parse(raw) });
    } catch {}
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (hydrated && !publishedId) localStorage.setItem(DRAFT_KEY, JSON.stringify(d));
  }, [d, hydrated, publishedId]);

  useEffect(() => {
    if (d.step !== 3) return;
    const ctl = new AbortController();
    fetch(`/api/areas?q=${encodeURIComponent(areaQ)}`, { signal: ctl.signal })
      .then((r) => r.json()).then((x) => setAreas(x.areas)).catch(() => {});
    return () => ctl.abort();
  }, [areaQ, d.step]);

  const groupCats = useMemo(
    () => categories.filter((c) => c.group === d.group),
    [categories, d.group],
  );
  const isEmotional = d.group === 'emotional';
  const totalSteps = isEmotional ? 8 : 7;
  const set = (patch: Partial<Draft>) => setD((prev) => ({ ...prev, ...patch }));
  const iso = (offset: number) => {
    const x = new Date(); x.setDate(x.getDate() + offset);
    return x.toISOString().slice(0, 10);
  };

  async function publish() {
    setBusy(true);
    setFailed(false);
    const res = await fetch('/api/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        categoryId: d.categoryId,
        beneficiaryType: d.beneficiary === 'self' ? 'self' : 'care_recipient',
        beneficiaryId: d.beneficiary === 'self' ? undefined : d.beneficiary,
        destinationText: d.destinationText,
        areaId: d.areaId ?? defaultAreaId,
        exactAddress: d.exactAddress || undefined,
        whenType: d.whenType,
        date: d.date ?? undefined,
        time: d.time,
        durationMin: d.durationMin,
        description: d.description,
        mood: isEmotional ? d.mood : undefined,
        prefs: { gender: d.gender, languages: d.prefLangs, verifiedOnly: d.verifiedOnly, driving: d.driving },
        visibility: d.visibility,
      }),
    });
    setBusy(false);
    if (!res.ok) { setFailed(true); return; }
    const body = await res.json();
    localStorage.removeItem(DRAFT_KEY);
    setPublishedId(body.id);
    setExpiresAt(body.expiresAt);
  }

  if (!hydrated) {
    return <main className="screen-pad"><Skeleton lines={4} /></main>;
  }

  /* E11 · Published ★ — Sisi waiting; the promise line is kept by the
     request-expiry job. */
  if (publishedId) {
    return (
      <main className="screen-pad" style={{ display: 'grid', gap: 'var(--s-4)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--s-8) 0 0' }}>
          <Sisi state="waiting" size={98} />
        </div>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.5em', textAlign: 'center', margin: 0 }}>
          {t('publishedTitle')}
        </h1>
        <p style={{ color: 'var(--n-700)', textAlign: 'center', margin: 0 }}>{t('publishedBody')}</p>
        {expiresAt && (
          <Banner variant="info">
            {t('publishedPromise', {
              when: format.dateTime(new Date(expiresAt), { weekday: 'long', hour: 'numeric', minute: '2-digit' }),
            })}
          </Banner>
        )}
        <Link href={`/${locale}/requests/${publishedId}`} className="btn btn-primary btn-lg" style={{ textDecoration: 'none' }}>
          {t('viewRequest')}
        </Link>
      </main>
    );
  }

  const header = (
    <>
      <Stepper current={d.step} total={totalSteps} saved />
    </>
  );

  /* E1 · category — a grid, not a dropdown: the categories ARE the product */
  if (d.step === 1) {
    return (
      <main className="screen-pad" style={{ display: 'grid', gap: 'var(--s-4)' }}>
        {header}
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.5em', margin: 0 }}>{t('step1Title')}</h1>
        <RadioCards
          columns={2}
          value={d.group}
          onChange={(g) => {
            const first = categories.find((c) => c.group === g);
            set({ group: g, categoryId: first?.id ?? null });
          }}
          options={GROUPS.map((g) => ({ value: g, label: tp(`group.${g}` as never) }))}
        />
        {d.group && groupCats.length > 1 && (
          <>
            <p className="field-hint" style={{ margin: 0 }}>{t('refineHint')}</p>
            <Chips
              label={t('step1Title')}
              options={groupCats.map((c) => ({ value: c.id, label: c.name }))}
              selected={d.categoryId ? [d.categoryId] : []}
              onChange={(next) => set({ categoryId: next[next.length - 1] ?? d.categoryId })}
            />
          </>
        )}
        <Button disabled={!d.categoryId} onClick={() => set({ step: 2 })}>{t('continue')}</Button>
      </main>
    );
  }

  /* E2 · who — the screen that makes family-managed requests work */
  if (d.step === 2) {
    return (
      <main className="screen-pad" style={{ display: 'grid', gap: 'var(--s-4)' }}>
        {header}
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.5em', margin: 0 }}>{t('step2Title')}</h1>
        <RadioCards
          value={d.beneficiary}
          onChange={(v) => set({ beneficiary: v })}
          options={[
            { value: 'self', label: t('forMe') },
            ...recipients.map((r) => ({
              value: r.id,
              label: r.name,
              description: r.relationship ? t(`rel.${r.relationship}` as never) : undefined,
            })),
          ]}
        />
        <Link href={`/${locale}/care/new`} className="btn btn-line" style={{ textDecoration: 'none' }}>
          {t('addSomeone')}
        </Link>
        {d.beneficiary && d.beneficiary !== 'self' && (
          <Banner variant="info">{t('recipientNote')}</Banner>
        )}
        <Button disabled={!d.beneficiary} onClick={() => set({ step: 3 })}>{t('continue')}</Button>
        <Button variant="ghost" size="md" onClick={() => set({ step: 1 })}>{t('back')}</Button>
      </main>
    );
  }

  /* E3 · where — approximate now; the exact address is explained, optional */
  if (d.step === 3) {
    const localName = (a: AreaRow) =>
      (locale === 'ms' ? a.nameMs : locale === 'ta' ? a.nameTa : locale === 'zh' ? a.nameZh : a.name) ?? a.name;
    return (
      <main className="screen-pad" style={{ display: 'grid', gap: 'var(--s-4)' }}>
        {header}
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.5em', margin: 0 }}>{t('step3Title')}</h1>
        <TextField
          label={t('destinationLabel')}
          hint={t('destinationHint')}
          value={d.destinationText}
          onChange={(e) => set({ destinationText: (e.target as HTMLInputElement).value })}
        />
        <TextField
          label={t('areaSearchLabel')}
          value={areaQ}
          onChange={(e) => setAreaQ((e.target as HTMLInputElement).value)}
        />
        {areas === null ? <Skeleton lines={3} /> : (
          <div className="stack" role="radiogroup" aria-label={t('areaSearchLabel')}>
            {areas.slice(0, 6).map((a) => (
              <button key={a.id} role="radio" aria-checked={d.areaId === a.id}
                className={['option-row', d.areaId === a.id ? 'is-selected' : ''].join(' ').trim()}
                onClick={() => set({ areaId: a.id })}>
                <span style={{ fontWeight: 600 }}>{localName(a)}</span>
                <span className="or-tick" aria-hidden="true">✓</span>
              </button>
            ))}
          </div>
        )}
        <TextField
          label={t('exactLabel')}
          hint={t('exactHint')}
          optional
          value={d.exactAddress}
          onChange={(e) => set({ exactAddress: (e.target as HTMLInputElement).value })}
        />
        <Button disabled={!d.destinationText.trim() || !d.areaId} onClick={() => set({ step: 4 })}>
          {t('continue')}
        </Button>
        <Button variant="ghost" size="md" onClick={() => set({ step: 2 })}>{t('back')}</Button>
      </main>
    );
  }

  /* E4 · when */
  if (d.step === 4) {
    return (
      <main className="screen-pad" style={{ display: 'grid', gap: 'var(--s-4)' }}>
        {header}
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.5em', margin: 0 }}>{t('step4Title')}</h1>
        <RadioCards
          value={d.whenType}
          onChange={(v) => set({ whenType: v })}
          options={[
            { value: 'asap', label: t('whenAsap'), description: t('whenAsapSub') },
            { value: 'today', label: t('whenToday') },
            { value: 'date', label: t('whenDate') },
          ]}
        />
        {d.whenType === 'date' && (
          <>
            <DayPicker
              days={[iso(1), iso(2), iso(3)]}
              value={d.date}
              onChange={(x) => { set({ date: x }); setShowCal(false); }}
              moreLabel={t('moreDays')}
              onMore={() => setShowCal(true)}
            />
            {showCal && (
              <Calendar month={`${iso(0).slice(0, 7)}-01`} selected={d.date} onSelect={(x) => set({ date: x })} />
            )}
          </>
        )}
        {(d.whenType === 'today' || d.whenType === 'date') && (
          <Select label={t('timeLabel')} value={d.time} onChange={(e) => set({ time: e.target.value })}
            options={HOURS.map((h) => ({ value: h, label: h }))} />
        )}
        {d.whenType && (
          <div>
            <p className="label" style={{ color: 'var(--n-700)', margin: '0 0 0.4em' }}>{t('durationLabel')}</p>
            <Counter
              valueLabel={t('durationValue', { hours: d.durationMin / 60 })}
              onDecrement={() => set({ durationMin: Math.max(60, d.durationMin - 60) })}
              onIncrement={() => set({ durationMin: Math.min(360, d.durationMin + 60) })}
              decrementLabel={t('less')}
              incrementLabel={t('more')}
              min={d.durationMin <= 60}
              max={d.durationMin >= 360}
            />
          </div>
        )}
        <Button
          disabled={!d.whenType || (d.whenType === 'date' && !d.date)}
          onClick={() => set({ step: 5 })}
        >
          {t('continue')}
        </Button>
        <Button variant="ghost" size="md" onClick={() => set({ step: 3 })}>{t('back')}</Button>
      </main>
    );
  }

  /* E5 · what kind of help */
  if (d.step === 5) {
    const recipient = recipients.find((r) => r.id === d.beneficiary);
    return (
      <main className="screen-pad" style={{ display: 'grid', gap: 'var(--s-4)' }}>
        {header}
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.5em', margin: 0 }}>{t('step5Title')}</h1>
        <p style={{ color: 'var(--n-700)', margin: 0 }}>{t('step5Hint')}</p>
        <TextField
          label={t('descriptionLabel')}
          multiline
          value={d.description}
          onChange={(e) => set({ description: (e.target as HTMLTextAreaElement).value })}
        />
        {recipient && recipient.accessibility.length > 0 && (
          <Banner variant="info">
            {t('accessReminder', { name: recipient.name })}
          </Banner>
        )}
        <Button onClick={() => set({ step: isEmotional ? 6 : 6 })}>{t('continue')}</Button>
        <Button variant="ghost" size="md" onClick={() => set({ step: 4 })}>{t('back')}</Button>
      </main>
    );
  }

  /* E8 · emotional only: what would help today */
  if (d.step === 6 && isEmotional) {
    return (
      <main className="screen-pad" style={{ display: 'grid', gap: 'var(--s-4)' }}>
        {header}
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.5em', margin: 0 }}>{t('moodTitle')}</h1>
        <Chips
          label={t('moodTitle')}
          options={MOODS.map((m) => ({ value: m, label: t(`mood.${m}` as never) }))}
          selected={d.mood}
          onChange={(next) => set({ mood: next })}
        />
        <Button onClick={() => set({ step: 7 })}>{t('continue')}</Button>
        <Button variant="ghost" size="md" onClick={() => set({ step: 5 })}>{t('back')}</Button>
      </main>
    );
  }

  /* E6 · preferences — all optional, marked as such */
  if ((d.step === 6 && !isEmotional) || (d.step === 7 && isEmotional)) {
    const nextStep = isEmotional ? 8 : 7;
    const prevStep = isEmotional ? 6 : 5;
    return (
      <main className="screen-pad" style={{ display: 'grid', gap: 'var(--s-4)' }}>
        {header}
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.5em', margin: 0 }}>{t('step6Title')}</h1>
        <p style={{ color: 'var(--n-700)', margin: 0 }}>{t('step6Hint')}</p>
        <p className="label" style={{ color: 'var(--n-700)', margin: 0 }}>{t('prefLanguage')}</p>
        <Chips
          label={t('prefLanguage')}
          options={['ms', 'en', 'ta', 'zh-mandarin', 'zh-cantonese', 'hokkien'].map((l) => ({
            value: l, label: tp(`lang.${l}` as never),
          }))}
          selected={d.prefLangs}
          onChange={(next) => set({ prefLangs: next })}
        />
        <p className="label" style={{ color: 'var(--n-700)', margin: 0 }}>{t('prefGender')}</p>
        <Segmented
          label={t('prefGender')}
          value={d.gender}
          onChange={(g) => set({ gender: g })}
          options={[
            { value: 'any', label: t('genderAny') },
            { value: 'women', label: t('genderWomen') },
            { value: 'men', label: t('genderMen') },
          ]}
        />
        <Switch title={t('verifiedOnly')} sub={t('verifiedOnlySub')} checked={d.verifiedOnly}
          onChange={(v) => set({ verifiedOnly: v })} />
        <Switch title={t('needsDriving')} checked={d.driving} onChange={(v) => set({ driving: v })} />
        <Button onClick={() => set({ step: nextStep })}>{t('continue')}</Button>
        <Button variant="ghost" size="md" onClick={() => set({ step: prevStep })}>{t('back')}</Button>
      </main>
    );
  }

  /* E9/E10 · review + visibility, every line editable by stepping back */
  const cat = categories.find((c) => c.id === d.categoryId);
  const who = d.beneficiary === 'self' ? t('forMe') : recipients.find((r) => r.id === d.beneficiary)?.name ?? '';
  const whenText = d.whenType === 'asap' ? t('whenAsap')
    : d.whenType === 'today' ? `${t('whenToday')} · ${d.time}`
    : `${d.date ?? ''} · ${d.time}`;
  return (
    <main className="screen-pad" style={{ display: 'grid', gap: 'var(--s-4)' }}>
      {header}
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.5em', margin: 0 }}>{t('reviewTitle')}</h1>
      <div className="card">
        {[
          [t('reviewFor'), who, 2],
          [t('reviewWhat'), cat?.name ?? '', 1],
          [t('reviewWhere'), d.destinationText, 3],
          [t('reviewWhen'), whenText, 4],
          [t('reviewHelp'), d.description || '—', 5],
        ].map(([label, value, step], i) => (
          <div key={i} style={{ display: 'flex', gap: '0.6em', padding: '0.3em 0', alignItems: 'baseline' }}>
            <span style={{ color: 'var(--n-700)', flex: '0 0 6em', fontSize: '0.85em' }}>{label as string}</span>
            <span style={{ flex: 1, minWidth: 0 }}>{value as string}</span>
            <button className="btn btn-line" style={{ width: 'auto', minHeight: 'var(--tap-min)', fontSize: '0.85em' }}
              onClick={() => set({ step: step as number })}>
              {t('edit')}
            </button>
          </div>
        ))}
      </div>
      <p className="label" style={{ color: 'var(--n-700)', margin: 0 }}>{t('visibilityTitle')}</p>
      <RadioCards
        value={d.visibility}
        onChange={(v) => set({ visibility: v })}
        options={[
          { value: 'public', label: t('visPublic'), description: t('visPublicSub') },
          { value: 'trusted_only', label: t('visTrusted'), description: t('visTrustedSub') },
        ]}
      />
      {failed && <Banner variant="error">{t('publishFailed')}</Banner>}
      <Button loading={busy} onClick={publish}>{t('publishCta')}</Button>
      <Button variant="ghost" size="md" onClick={() => set({ step: isEmotional ? 7 : 6 })}>{t('back')}</Button>
    </main>
  );
}
