'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations, useFormatter } from 'next-intl';
import { Card } from '@/components/Card';
import { Pill, type PillVariant } from '@/components/Pill';
import { EmptyState } from '@/components/EmptyState';

type Row = { id: string; title: string; status: string; startsAt: string; forName: string | null };

const TABS = ['looking', 'matched', 'upcoming', 'completed', 'cancelled'] as const;
type Tab = (typeof TABS)[number];

function tabOf(r: Row): Tab {
  if (r.status === 'looking') return 'looking';
  if (r.status === 'matched' || r.status === 'active') {
    return new Date(r.startsAt).getTime() > Date.now() ? 'upcoming' : 'matched';
  }
  if (r.status === 'completed') return 'completed';
  return 'cancelled'; // cancelled + expired
}

const PILL: Record<string, PillVariant> = {
  looking: 'looking', matched: 'matched', active: 'live',
  completed: 'completed', cancelled: 'neutral', expired: 'error', draft: 'neutral',
};

export function RequestTabs({ rows }: { rows: Row[] }) {
  const t = useTranslations('req');
  const locale = useLocale();
  const format = useFormatter();
  const [tab, setTab] = useState<Tab>('looking');
  const shown = rows.filter((r) => tabOf(r) === tab);

  return (
    <div style={{ display: 'grid', gap: 'var(--s-3)' }}>
      <div className="chips" role="tablist" aria-label={t('listTitle')}>
        {TABS.map((x) => (
          <button key={x} role="tab" aria-selected={tab === x} aria-pressed={tab === x}
            className="chip" onClick={() => setTab(x)}>
            {t(`tab.${x}`)}
          </button>
        ))}
      </div>
      {shown.length === 0 ? (
        <EmptyState illustration="none" title={t(`tabEmpty.${tab}`)} body={t('tabEmptyBody')} />
      ) : (
        <div className="stack">
          {shown.map((r) => (
            <Link key={r.id} href={`/${locale}/requests/${r.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <Card
                accent={r.status === 'matched' || r.status === 'active' ? 'connection' : 'waiting'}
                title={r.forName ? t('titleFor', { title: r.title, name: r.forName }) : r.title}
                meta={format.dateTime(new Date(r.startsAt), {
                  weekday: 'long', day: 'numeric', month: 'long', hour: 'numeric', minute: '2-digit',
                })}
              >
                <p style={{ margin: '0.4em 0 0' }}>
                  <Pill variant={PILL[r.status] ?? 'neutral'}>{t(`status.${r.status}`)}</Pill>
                </p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
