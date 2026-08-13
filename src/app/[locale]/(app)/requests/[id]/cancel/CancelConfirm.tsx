'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';

export function CancelConfirm({ requestId }: { requestId: string }) {
  const t = useTranslations('req');
  const locale = useLocale();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function cancel() {
    setBusy(true);
    const res = await fetch(`/api/requests/${requestId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'cancel' }),
    });
    setBusy(false);
    if (res.ok) {
      router.push(`/${locale}/requests`);
      router.refresh();
    }
  }

  return (
    <div className="stack">
      {/* cancel is primary here; keeping the request is the ghost — the
          person came to this screen to do exactly this */}
      <Button loading={busy} onClick={cancel}>{t('cancelConfirm')}</Button>
      <Button variant="ghost" onClick={() => router.back()}>{t('cancelKeep')}</Button>
    </div>
  );
}
