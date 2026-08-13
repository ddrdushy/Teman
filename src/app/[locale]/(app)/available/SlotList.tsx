'use client';

import { useState } from 'react';
import { useLocale, useTranslations, useFormatter } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Toast } from '@/components/Toast';
import { Pill } from '@/components/Pill';

type Slot = {
  id: string;
  startsAt: string;
  endsAt: string;
  radiusM: number;
  repeatsWeekly: boolean;
  categoriesCount: number;
};

export function SlotList({ slots }: { slots: Slot[] }) {
  const t = useTranslations('avail');
  const locale = useLocale();
  const format = useFormatter();
  const router = useRouter();
  const [removed, setRemoved] = useState<Slot | null>(null);

  async function remove(slot: Slot) {
    await fetch(`/api/availability?id=${slot.id}`, { method: 'DELETE' });
    setRemoved(slot);
    router.refresh();
  }

  async function undo() {
    if (!removed) return;
    const start = new Date(removed.startsAt);
    const end = new Date(removed.endsAt);
    const pad = (n: number) => String(n).padStart(2, '0');
    await fetch('/api/availability', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}`,
        from: `${pad(start.getHours())}:${pad(start.getMinutes())}`,
        until: `${pad(end.getHours())}:${pad(end.getMinutes())}`,
        radius: removed.radiusM <= 1000 ? 'walking' : removed.radiusM <= 5000 ? 'area' : 'city',
        repeatsWeekly: removed.repeatsWeekly,
      }),
    });
    router.refresh();
  }

  const radiusKey = (m: number) => (m <= 1000 ? 'walking' : m <= 5000 ? 'area' : 'city');

  return (
    <div className="stack">
      {slots.map((s) => (
        <Card
          key={s.id}
          title={format.dateTime(new Date(s.startsAt), { weekday: 'long', day: 'numeric', month: 'long' })}
          meta={`${format.dateTime(new Date(s.startsAt), { hour: 'numeric', minute: '2-digit' })} – ${format.dateTime(new Date(s.endsAt), { hour: 'numeric', minute: '2-digit' })} · ${t(`radius.${radiusKey(s.radiusM)}`)}`}
        >
          {s.repeatsWeekly && (
            <p style={{ margin: '0.4em 0 0' }}><Pill variant="neutral">{t('repeatsWeekly')}</Pill></p>
          )}
          <div style={{ display: 'flex', gap: 'var(--tap-gap)', marginTop: '0.6em' }}>
            <Link href={`/${locale}/available/${s.id}/edit`} className="btn btn-ghost" style={{ minHeight: 'var(--tap-min)', textDecoration: 'none', flex: 1 }}>
              {t('edit')}
            </Link>
            <Button variant="line" size="md" style={{ flex: 1 }} onClick={() => remove(s)}>
              {t('remove')}
            </Button>
          </div>
        </Card>
      ))}
      {removed && (
        <Toast message={t('removedToast')} onUndo={undo} onDismiss={() => setRemoved(null)} />
      )}
    </div>
  );
}
