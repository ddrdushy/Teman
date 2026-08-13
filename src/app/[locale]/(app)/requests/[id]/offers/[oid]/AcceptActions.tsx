'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { Sheet } from '@/components/Sheet';

/* Accept wears amber — a person answered, this is THE connection action.
   Decline is a ghost with a full confirm, and the request stays looking. */
export function AcceptActions({ offerId, requestId, firstName }: {
  offerId: string;
  requestId: string;
  firstName: string;
}) {
  const t = useTranslations('offer');
  const locale = useLocale();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [declineOpen, setDeclineOpen] = useState(false);

  async function act(action: 'accept' | 'decline') {
    setBusy(true);
    const res = await fetch(`/api/offers/${offerId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    setBusy(false);
    if (!res.ok) return;
    if (action === 'accept') {
      const { matchId } = await res.json();
      router.push(`/${locale}/matches/${matchId}`);
    } else {
      router.push(`/${locale}/requests/${requestId}`);
    }
    router.refresh();
  }

  return (
    <div className="stack">
      <Button variant="connection" loading={busy} onClick={() => act('accept')}>
        {t('acceptCta', { name: firstName })}
      </Button>
      <Button variant="ghost" size="md" onClick={() => setDeclineOpen(true)}>
        {t('declineCta')}
      </Button>
      <Sheet title={t('declineTitle')} open={declineOpen} onClose={() => setDeclineOpen(false)}>
        <p style={{ margin: '0 0 var(--s-3)' }}>{t('declineBody')}</p>
        <Button variant="primary" size="md" loading={busy} onClick={() => act('decline')}>
          {t('declineConfirm')}
        </Button>
      </Sheet>
    </div>
  );
}
