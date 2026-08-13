'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { RadioCards } from '@/components/RadioCards';
import { TextField } from '@/components/TextField';

const REASONS = ['blurry', 'cutOff', 'nameMismatch', 'expired', 'notAnId', 'other'] as const;
type Reason = (typeof REASONS)[number];

/* Approve / Reject with a reason from a list. Keyboard: A approve, R opens
   reject, → next in queue — this screen is sat in for an hour during a
   recruitment drive. */
export function ReviewActions({ verificationId }: { verificationId: string }) {
  const t = useTranslations('admin');
  const locale = useLocale();
  const router = useRouter();
  const [mode, setMode] = useState<'idle' | 'rejecting'>('idle');
  const [reason, setReason] = useState<Reason | null>(null);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  async function decide(decision: 'approve' | 'reject') {
    setBusy(true);
    const res = await fetch(`/api/admin/verifications/${verificationId}/decide`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(decision === 'approve'
        ? { decision }
        : { decision, reasonKey: reason, note: note.trim() || undefined }),
    });
    setBusy(false);
    if (res.ok) {
      const { nextId } = await res.json();
      router.push(nextId ? `/${locale}/admin/verifications/${nextId}` : `/${locale}/admin/verifications`);
      router.refresh();
    }
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const el = e.target as HTMLElement;
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') return;
      if (e.key === 'a' || e.key === 'A') decide('approve');
      if (e.key === 'r' || e.key === 'R') setMode('rejecting');
      if (e.key === 'ArrowRight') router.push(`/${locale}/admin/verifications`);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);

  if (mode === 'rejecting') {
    return (
      <div style={{ display: 'grid', gap: '12px', maxWidth: '480px' }}>
        <RadioCards
          value={reason}
          onChange={setReason}
          options={REASONS.map((r) => ({ value: r, label: t(`reject.${r}`) }))}
        />
        <TextField
          label={t('reject.noteLabel')}
          optional
          value={note}
          onChange={(e) => setNote((e.target as HTMLInputElement).value)}
        />
        <Button variant="danger" size="md" loading={busy} disabled={!reason} onClick={() => decide('reject')}>
          {t('reject.confirm')}
        </Button>
        <Button variant="ghost" size="md" onClick={() => setMode('idle')}>{t('reject.back')}</Button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: '12px', maxWidth: '480px' }}>
      <Button size="md" loading={busy} onClick={() => decide('approve')}>
        {t('review.approve')}
      </Button>
      <Button variant="ghost" size="md" onClick={() => setMode('rejecting')}>
        {t('review.reject')}
      </Button>
    </div>
  );
}
