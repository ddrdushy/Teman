'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/components/Button';
import { Chips } from '@/components/Chips';
import { Banner } from '@/components/Banner';
import { Sisi } from '@/components/Sisi';

const DESCRIPTORS = ['kind', 'respectful', 'patient', 'reliable', 'helpful', 'goodListener'];

export function FeedbackFlow({ sessionId, otherName }: { sessionId: string; otherName: string }) {
  const t = useTranslations('feedback');
  const locale = useLocale();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [descriptors, setDescriptors] = useState<string[]>([]);
  const [feltSafe, setFeltSafe] = useState<boolean | null>(null);
  const [again, setAgain] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  async function submit() {
    setBusy(true);
    setFailed(false);
    const res = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        descriptors,
        feltSafe: feltSafe ?? undefined,
        wouldMeetAgain: again ?? undefined,
      }),
    });
    setBusy(false);
    if (res.ok || res.status === 409) setStep(3);
    else setFailed(true);
  }

  /* J1 · words, never stars — nothing here is required */
  if (step === 1) {
    return (
      <main className="screen-pad" style={{ display: 'grid', gap: 'var(--s-4)' }}>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.5em', margin: 0 }}>
          {t('howWasIt', { name: otherName })}
        </h1>
        <p style={{ color: 'var(--n-700)', margin: 0 }}>{t('wordsHint')}</p>
        <Chips
          label={t('howWasIt', { name: otherName })}
          options={DESCRIPTORS.map((d) => ({ value: d, label: t(`descriptor.${d}` as never) }))}
          selected={descriptors}
          onChange={setDescriptors}
        />
        <Button onClick={() => setStep(2)}>{t('continue')}</Button>
      </main>
    );
  }

  /* J2 · the private questions — marked private, and they are */
  if (step === 2) {
    return (
      <main className="screen-pad" style={{ display: 'grid', gap: 'var(--s-4)' }}>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.5em', margin: 0 }}>{t('privateTitle')}</h1>
        <Banner variant="info">{t('privateNote', { name: otherName })}</Banner>

        <p className="label" style={{ color: 'var(--n-700)', margin: 0 }}>{t('feltSafeQ')}</p>
        <div style={{ display: 'flex', gap: 'var(--tap-gap)' }}>
          {[true, false].map((v) => (
            <button key={String(v)} role="radio" aria-checked={feltSafe === v}
              className={['option-row', feltSafe === v ? 'is-selected' : ''].join(' ').trim()}
              style={{ flex: 1, justifyContent: 'center' }}
              onClick={() => setFeltSafe(v)}>
              {v ? t('yes') : t('no')}
            </button>
          ))}
        </div>

        <p className="label" style={{ color: 'var(--n-700)', margin: 0 }}>{t('againQ', { name: otherName })}</p>
        <div style={{ display: 'flex', gap: 'var(--tap-gap)' }}>
          {[true, false].map((v) => (
            <button key={String(v)} role="radio" aria-checked={again === v}
              className={['option-row', again === v ? 'is-selected' : ''].join(' ').trim()}
              style={{ flex: 1, justifyContent: 'center' }}
              onClick={() => setAgain(v)}>
              {v ? t('yes') : t('no')}
            </button>
          ))}
        </div>

        {feltSafe === false && <Banner variant="info">{t('unsafeWhatHappens')}</Banner>}
        {failed && <Banner variant="error">{t('failed')}</Banner>}
        <Button loading={busy} onClick={submit}>{t('send')}</Button>
        <Button variant="ghost" size="md" onClick={() => setStep(1)}>{t('back')}</Button>
      </main>
    );
  }

  /* J3 ★ · the Teman Moment — the only badge the product ever gives */
  return (
    <main className="on-deep" style={{
      minHeight: 'calc(100dvh - 66px)', background: 'var(--t-900)', color: 'var(--white)',
      padding: 'var(--s-6) var(--s-5)', display: 'grid', gap: 'var(--s-4)',
      alignContent: 'center', textAlign: 'center', maxWidth: '44ch', margin: '0 auto', width: '100%',
    }}>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Sisi state="moment" size={112} tone="dark" />
      </div>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.6em', margin: 0, color: 'var(--white)' }}>
        {t('momentTitle')}
      </h1>
      <p style={{ color: 'var(--t-100)', margin: 0 }}>{t('momentBody', { name: otherName })}</p>
      <ProposeRecurring sessionId={sessionId} otherName={otherName} />
      <Link href={`/${locale}/home`} className="btn btn-ghost btn-lg" style={{ textDecoration: 'none' }}>
        {t('done')}
      </Link>
    </main>
  );
}

/* K3 · "Make this recurring?" — offered at the moment it would occur to you. */
function ProposeRecurring({ sessionId, otherName }: { sessionId: string; otherName: string }) {
  const t = useTranslations('community');
  const [freq, setFreq] = useState<string | null>(null);
  const [proposed, setProposed] = useState(false);
  const [busy, setBusy] = useState(false);

  async function propose(frequency: string) {
    setBusy(true);
    const res = await fetch('/api/recurring', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, frequency, timeOfDay: '09:00' }),
    });
    setBusy(false);
    if (res.ok) setProposed(true);
  }

  if (proposed) {
    return <Banner variant="success">{t('recurringProposedNote', { name: otherName })}</Banner>;
  }
  return (
    <div style={{ display: 'grid', gap: 'var(--s-2)' }}>
      <p style={{ color: 'var(--t-100)', margin: 0, fontSize: '0.9em' }}>{t('makeRecurringQ', { name: otherName })}</p>
      <div className="chips" style={{ justifyContent: 'center' }}>
        {['weekly', 'fortnightly', 'monthly'].map((f) => (
          <button key={f} type="button" className="chip" aria-pressed={freq === f}
            disabled={busy}
            onClick={() => { setFreq(f); propose(f); }}>
            {t(`freq.${f}` as never)}
          </button>
        ))}
      </div>
    </div>
  );
}
