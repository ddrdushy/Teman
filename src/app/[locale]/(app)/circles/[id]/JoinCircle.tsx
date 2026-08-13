'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { Pill } from '@/components/Pill';

export function JoinCircle({ circleId, membership }: {
  circleId: string;
  membership: string | null;   // null | 'member' | 'pending'
}) {
  const t = useTranslations('community');
  const router = useRouter();

  async function act(action: 'join' | 'leave') {
    await fetch('/api/circles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, circleId }),
    });
    router.refresh();
  }

  if (membership === 'member') {
    return (
      <div style={{ display: 'grid', gap: 'var(--s-2)' }}>
        <Pill variant="completed">{t('youAreMember')}</Pill>
        <Button variant="line" size="md" onClick={() => act('leave')}>{t('leaveCircle')}</Button>
      </div>
    );
  }
  if (membership === 'pending') {
    return <Pill variant="looking">{t('joinPending')}</Pill>;
  }
  return <Button onClick={() => act('join')}>{t('joinCircle')}</Button>;
}
