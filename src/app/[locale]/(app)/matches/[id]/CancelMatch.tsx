'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { Sheet } from '@/components/Sheet';

/* H8 · Cancel after matching — states the impact honestly before confirming. */
export function CancelMatch({ matchId }: { matchId: string }) {
  const t = useTranslations('coord');
  const locale = useLocale();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function cancel() {
    setBusy(true);
    const res = await fetch(`/api/matches/${matchId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'cancel' }),
    });
    setBusy(false);
    if (res.ok) {
      router.push(`/${locale}/home`);
      router.refresh();
    }
  }

  return (
    <>
      <Button variant="line" size="md" onClick={() => setOpen(true)}>{t('cancelCta')}</Button>
      <Sheet title={t('cancelTitle')} open={open} onClose={() => setOpen(false)}>
        <p style={{ margin: '0 0 var(--s-3)' }}>{t('cancelImpact')}</p>
        <Button variant="primary" size="md" loading={busy} onClick={cancel}>{t('cancelConfirm')}</Button>
      </Sheet>
    </>
  );
}
