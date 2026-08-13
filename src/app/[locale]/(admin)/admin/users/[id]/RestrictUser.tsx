'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { Banner } from '@/components/Banner';

/* N4 · Restrict or reinstate. A typed reason is mandatory; the banner
   states exactly what the member experiences. */
export function RestrictUser({ personId, suspended }: { personId: string; suspended: boolean }) {
  const t = useTranslations('admin');
  const router = useRouter();
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  async function act(action: 'restrict' | 'reinstate') {
    setBusy(true);
    await fetch(`/api/admin/users/${personId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, reason }),
    });
    setBusy(false);
    router.refresh();
  }

  return (
    <div style={{ display: 'grid', gap: '10px', maxWidth: '480px' }}>
      <Banner variant="info">
        {suspended ? t('users.restrictedMeans') : t('users.restrictMeans')}
      </Banner>
      <TextField label={t('inc.reasonLabel')} value={reason}
        onChange={(e) => setReason((e.target as HTMLInputElement).value)} />
      {suspended ? (
        <Button size="md" loading={busy} disabled={!reason.trim()} onClick={() => act('reinstate')}>
          {t('users.reinstateCta')}
        </Button>
      ) : (
        <Button variant="line" size="md" loading={busy} disabled={!reason.trim()} onClick={() => act('restrict')}>
          {t('users.restrictCta')}
        </Button>
      )}
    </div>
  );
}
