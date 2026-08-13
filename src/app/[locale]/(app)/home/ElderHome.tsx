'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { BigAction } from '@/components/BigAction';
import { Sheet } from '@/components/Sheet';
import { EmptyState } from '@/components/EmptyState';
import { Sisi } from '@/components/Sisi';
import { HomeBar } from './HomeBar';

/* B2 · Not a shrunken B1 — a different screen. Three actions in the person's
   own words. No counters, no discovery, no browsing. "Call my family" is
   always in the same position and never scrolls away. */
export function ElderHome({ name }: { name: string }) {
  const t = useTranslations();
  const locale = useLocale();
  const [familyOpen, setFamilyOpen] = useState(false);

  return (
    <main style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100dvh - 66px)' }}>
      <div className="screen-pad" style={{ display: 'grid', gap: 'var(--s-4)', flex: 1 }}>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.5em', margin: 0 }}>
          {t('home.greeting', { name })}
        </h1>
        <div className="stack">
          <BigAction
            icon={<Sisi state="waiting" size={26} tone="dark" />}
            title={t('elder.withMe')}
            onClick={() => { window.location.href = `/${locale}/requests/new`; }}
          />
          <BigAction
            variant="ghost"
            icon={<Sisi state="waiting" size={26} />}
            title={t('elder.talkTo')}
            onClick={() => { window.location.href = `/${locale}/requests/new`; }}
          />
        </div>
      </div>

      {/* pinned — same position forever, outside the scroll area */}
      <div style={{ position: 'sticky', bottom: 0, padding: 'var(--s-3) var(--s-5)', background: 'var(--n-050)', borderTop: '1px solid var(--n-200)' }}>
        <BigAction
          variant="ghost"
          icon={<span aria-hidden="true">☎</span>}
          title={t('elder.callFamily')}
          onClick={() => setFamilyOpen(true)}
        />
        <HomeBar inline />
      </div>

      <Sheet title={t('elder.callFamily')} open={familyOpen} onClose={() => setFamilyOpen(false)}>
        {/* Trusted contacts land in M6; until someone is saved this stays an
            honest explanation, not a dead button. */}
        <EmptyState
          illustration="none"
          title={t('elder.noContactsTitle')}
          body={t('elder.noContactsBody')}
        />
      </Sheet>
    </main>
  );
}
