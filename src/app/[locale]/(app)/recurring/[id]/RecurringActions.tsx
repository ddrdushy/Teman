'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { Banner } from '@/components/Banner';

export function RecurringActions({ id, state, iProposed }: {
  id: string;
  state: string;
  iProposed: boolean;
}) {
  const t = useTranslations('community');
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function act(action: string) {
    setBusy(true);
    await fetch('/api/recurring', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action }),
    });
    setBusy(false);
    router.refresh();
  }

  if (state === 'ended') return null;

  return (
    <div className="stack">
      {state === 'proposed' && (iProposed
        ? <Banner variant="info">{t('waitingAgreement')}</Banner>
        : <Button variant="connection" loading={busy} onClick={() => act('agree')}>{t('agreeCta')}</Button>
      )}
      {state === 'active' && (
        <Button variant="ghost" loading={busy} onClick={() => act('pause')}>{t('pauseCta')}</Button>
      )}
      {state === 'paused' && (
        <Button variant="ghost" loading={busy} onClick={() => act('resume')}>{t('resumeCta')}</Button>
      )}
      {/* ending needs no confirmation theatre and no reason — one press */}
      <Button variant="line" loading={busy} onClick={() => act('end')}>{t('endCta')}</Button>
    </div>
  );
}
