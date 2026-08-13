'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/Card';
import { Pill, type PillVariant } from '@/components/Pill';
import { Button } from '@/components/Button';

type Row = { id: string; state: string; title: string; when: string; matchLive: boolean };

const PILL: Record<string, PillVariant> = {
  offered: 'looking', accepted: 'matched', declined: 'neutral', withdrawn: 'neutral',
};

export function OfferList({ rows }: { rows: Row[] }) {
  const t = useTranslations('offer');
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function withdraw(id: string) {
    setBusy(id);
    await fetch(`/api/offers/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'withdraw' }),
    });
    setBusy(null);
    router.refresh();
  }

  return (
    <div className="stack">
      {rows.map((r) => (
        <Card key={r.id} accent={r.state === 'accepted' ? 'connection' : 'waiting'}
          title={r.title} meta={r.when}>
          <p style={{ margin: '0.4em 0 0' }}>
            <Pill variant={PILL[r.state] ?? 'neutral'}>{t(`state.${r.state}`)}</Pill>
          </p>
          {r.state === 'offered' && (
            <div style={{ marginTop: '0.6em' }}>
              <Button variant="line" size="md" loading={busy === r.id} onClick={() => withdraw(r.id)}>
                {t('withdrawCta')}
              </Button>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
