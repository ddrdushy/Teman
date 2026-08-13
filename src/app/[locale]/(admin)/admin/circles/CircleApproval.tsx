'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';

export function CircleApproval({ circleId }: { circleId: string }) {
  const t = useTranslations('admin');
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function approve() {
    setBusy(true);
    await fetch(`/api/admin/circles/${circleId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'approve' }),
    });
    setBusy(false);
    router.refresh();
  }

  return (
    <Button size="md" style={{ width: 'auto' }} loading={busy} onClick={approve}>
      {t('circ.approve')}
    </Button>
  );
}
