'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { RadioCards } from '@/components/RadioCards';
import { Banner } from '@/components/Banner';

const CATEGORIES = [
  'harassment', 'romanticSexual', 'moneyRequest', 'fraud',
  'unsafeDriving', 'impersonation', 'discrimination', 'abuse', 'other',
];

export function ReportForm({ sessionId, subjectPersonId }: {
  sessionId: string | null;
  subjectPersonId: string | null;
}) {
  const t = useTranslations('safety');
  const locale = useLocale();
  const [category, setCategory] = useState<string | null>(null);
  const [detail, setDetail] = useState('');
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [failed, setFailed] = useState(false);

  async function submit() {
    setBusy(true);
    setFailed(false);
    const res = await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category,
        detail: detail || undefined,
        sessionId: sessionId ?? undefined,
        subjectPersonId: subjectPersonId ?? undefined,
      }),
    });
    setBusy(false);
    if (res.ok) setSubmitted(true);
    else setFailed(true);
  }

  /* I12 · what happens now — a timeline, honest */
  if (submitted) {
    return (
      <main className="screen-pad" style={{ display: 'grid', gap: 'var(--s-4)' }}>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.5em', margin: 0 }}>{t('reportSentTitle')}</h1>
        <ol style={{ margin: 0, paddingInlineStart: '1.3em', display: 'grid', gap: '0.5em' }}>
          <li>{t('reportStep1')}</li>
          <li>{t('reportStep2')}</li>
          <li>{t('reportStep3')}</li>
        </ol>
        <Link href={`/${locale}/home`} className="btn btn-primary btn-lg" style={{ textDecoration: 'none' }}>
          {t('backHome')}
        </Link>
      </main>
    );
  }

  return (
    <main className="screen-pad" style={{ display: 'grid', gap: 'var(--s-4)' }}>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.5em', margin: 0 }}>{t('reportTitle')}</h1>
      <p style={{ color: 'var(--n-700)', margin: 0 }}>{t('reportLead')}</p>
      <RadioCards
        value={category}
        onChange={setCategory}
        options={CATEGORIES.map((c) => ({ value: c, label: t(`reportCat.${c}` as never) }))}
      />
      <TextField
        label={t('reportDetail')}
        optional
        multiline
        value={detail}
        onChange={(e) => setDetail((e.target as HTMLTextAreaElement).value)}
      />
      {failed && <Banner variant="error">{t('reportFailed')}</Banner>}
      <Button variant="danger" loading={busy} disabled={!category} onClick={submit}>
        {t('reportSubmit')}
      </Button>
    </main>
  );
}
