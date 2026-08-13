'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { Banner } from '@/components/Banner';

/* G4 · Make the offer — an optional short message; the requester sees trust
   facts, not a pitch. */
export function OfferForm({ requestId }: { requestId: string }) {
  const t = useTranslations('nearby');
  const locale = useLocale();
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [failed, setFailed] = useState(false);

  async function send() {
    setBusy(true);
    setFailed(false);
    const res = await fetch('/api/offers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId, message: message || undefined }),
    });
    setBusy(false);
    if (res.ok) {
      setSent(true);
      router.refresh();
    } else {
      setFailed(true);
    }
  }

  if (sent) {
    return <Banner variant="success">{t('offerSent')}</Banner>;
  }

  return (
    <div style={{ display: 'grid', gap: 'var(--s-3)' }}>
      <TextField
        label={t('messageLabel')}
        hint={t('messageHint')}
        optional
        multiline
        value={message}
        onChange={(e) => setMessage((e.target as HTMLTextAreaElement).value)}
      />
      <p className="field-hint" style={{ margin: 0 }}>{t('whatTheySee')}</p>
      {failed && <Banner variant="error">{t('offerFailed')}</Banner>}
      <Button loading={busy} onClick={send}>{t('offerCta')}</Button>
    </div>
  );
}
