'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { RadioCards } from '@/components/RadioCards';
import { Chips } from '@/components/Chips';
import { Stepper } from '@/components/Stepper';
import { locales, localeNames, type Locale } from '@/i18n';

const RELATIONSHIPS = ['parent', 'relative', 'spouse', 'friend', 'other'];
const AGE_BANDS = ['under60', '60s', '70s', '80s', '90plus'];
const ACCESS = ['wheelchair', 'slowWalking', 'restsOften', 'hearing', 'vision', 'noStairs'];
const CONV = ['justListen', 'casualChat', 'adviceOkay', 'noAdvice'];

export type RecipientData = {
  id?: string;
  preferredName: string;
  relationship: string | null;
  ageBand: string | null;
  preferredLanguage: string;
  mobilityNotes: string;
  accessibility: string[];
  conversationPrefs: string[];
  emergencyContact: { name: string; phone: string; relationship: string } | null;
};

/* C7/C8 · Stepped form: who → what a Teman should know → emergency contact.
   Free-text notes only — no structured medical fields, ever. Autosaves at
   each step when editing. */
export function RecipientForm({ initial }: { initial?: RecipientData }) {
  const t = useTranslations('care');
  const locale = useLocale();
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [d, setD] = useState<RecipientData>(initial ?? {
    preferredName: '', relationship: null, ageBand: null,
    preferredLanguage: locale, mobilityNotes: '', accessibility: [],
    conversationPrefs: [], emergencyContact: null,
  });
  const [ecName, setEcName] = useState(initial?.emergencyContact?.name ?? '');
  const [ecPhone, setEcPhone] = useState(initial?.emergencyContact?.phone ?? '');
  const [ecRel, setEcRel] = useState(initial?.emergencyContact?.relationship ?? '');
  const [busy, setBusy] = useState(false);

  async function save(final: boolean) {
    setBusy(true);
    const res = await fetch('/api/care', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...d,
        id: d.id,
        emergencyContact: ecName && ecPhone
          ? { name: ecName, phone: ecPhone, relationship: ecRel }
          : null,
      }),
    });
    setBusy(false);
    if (res.ok) {
      const { id } = await res.json();
      setD((prev) => ({ ...prev, id }));
      if (final) router.push(`/${locale}/care`);
    }
  }

  if (step === 1) {
    return (
      <div style={{ display: 'grid', gap: 'var(--s-4)' }}>
        <Stepper current={1} total={3} saved={Boolean(d.id)} />
        <TextField
          label={t('nameLabel')}
          hint={t('nameHint')}
          value={d.preferredName}
          onChange={(e) => setD({ ...d, preferredName: (e.target as HTMLInputElement).value })}
        />
        <h2 className="label" style={{ margin: 0, color: 'var(--n-700)' }}>{t('relationshipLabel')}</h2>
        <RadioCards
          value={d.relationship}
          onChange={(v) => setD({ ...d, relationship: v })}
          columns={2}
          options={RELATIONSHIPS.map((r) => ({ value: r, label: t(`relationship.${r}` as never) }))}
        />
        <h2 className="label" style={{ margin: 0, color: 'var(--n-700)' }}>{t('ageLabel')}</h2>
        <RadioCards
          value={d.ageBand}
          onChange={(v) => setD({ ...d, ageBand: v })}
          columns={2}
          options={AGE_BANDS.map((a) => ({ value: a, label: t(`ageBand.${a}` as never) }))}
        />
        <h2 className="label" style={{ margin: 0, color: 'var(--n-700)' }}>{t('languageLabel')}</h2>
        <RadioCards
          value={d.preferredLanguage}
          onChange={(v) => setD({ ...d, preferredLanguage: v })}
          columns={2}
          options={locales.map((l: Locale) => ({ value: l, label: localeNames[l].own }))}
        />
        <Button disabled={!d.preferredName.trim()} onClick={() => setStep(2)}>{t('next')}</Button>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div style={{ display: 'grid', gap: 'var(--s-4)' }}>
        <Stepper current={2} total={3} saved={Boolean(d.id)} />
        <h2 className="label" style={{ margin: 0, color: 'var(--n-700)' }}>{t('accessLabel')}</h2>
        <Chips
          label={t('accessLabel')}
          options={ACCESS.map((a) => ({ value: a, label: t(`access.${a}` as never) }))}
          selected={d.accessibility}
          onChange={(next) => setD({ ...d, accessibility: next })}
        />
        <h2 className="label" style={{ margin: 0, color: 'var(--n-700)' }}>{t('convLabel')}</h2>
        <Chips
          label={t('convLabel')}
          options={CONV.map((c) => ({ value: c, label: t(`conv.${c}` as never) }))}
          selected={d.conversationPrefs}
          onChange={(next) => setD({ ...d, conversationPrefs: next })}
        />
        <TextField
          label={t('notesLabel')}
          hint={t('notesHint')}
          optional
          multiline
          value={d.mobilityNotes}
          onChange={(e) => setD({ ...d, mobilityNotes: (e.target as HTMLTextAreaElement).value })}
        />
        <Button onClick={() => setStep(3)}>{t('next')}</Button>
        <Button variant="ghost" size="md" onClick={() => setStep(1)}>{t('back')}</Button>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gap: 'var(--s-4)' }}>
      <Stepper current={3} total={3} saved={Boolean(d.id)} />
      <h2 className="label" style={{ margin: 0, color: 'var(--n-700)' }}>{t('ecLabel')}</h2>
      <p className="field-hint" style={{ margin: 0 }}>{t('ecHint')}</p>
      <TextField label={t('ecName')} optional value={ecName}
        onChange={(e) => setEcName((e.target as HTMLInputElement).value)} />
      <TextField label={t('ecPhone')} optional inputMode="tel" value={ecPhone}
        onChange={(e) => setEcPhone((e.target as HTMLInputElement).value)} />
      <TextField label={t('ecRel')} optional value={ecRel}
        onChange={(e) => setEcRel((e.target as HTMLInputElement).value)} />
      <Button loading={busy} onClick={() => save(true)}>{t('saveCta')}</Button>
      <Button variant="ghost" size="md" onClick={() => setStep(2)}>{t('back')}</Button>
    </div>
  );
}
