'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';

export function FlaggedActions({ requestId }: { requestId: string }) {
  const t = useTranslations('admin');
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function act(action: 'keep' | 'remove') {
    setBusy(action);
    await fetch(`/api/admin/flagged/${requestId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    setBusy(null);
    router.refresh();
  }

  return (
    <div style={{ display: 'flex', gap: '10px' }}>
      <Button size="md" variant="ghost" style={{ width: 'auto' }} loading={busy === 'keep'} onClick={() => act('keep')}>
        {t('flag.keep')}
      </Button>
      <Button size="md" variant="line" style={{ width: 'auto' }} loading={busy === 'remove'} onClick={() => act('remove')}>
        {t('flag.remove')}
      </Button>
    </div>
  );
}
