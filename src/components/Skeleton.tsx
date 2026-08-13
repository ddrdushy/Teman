'use client';

import { useTranslations } from 'next-intl';

/** Grey shapes matching the eventual layout. The only looping animation in
 *  the product, because the loop IS the message. CSS delays it 400ms — a
 *  flash of skeleton is worse than none. */
export function Skeleton({ lines = 3 }: { lines?: number }) {
  const t = useTranslations('ui');
  const widths = ['62%', '88%', '74%', '81%', '58%'];
  return (
    <div role="status" aria-label={t('loading')} style={{ display: 'grid', gap: '0.5em' }}>
      {Array.from({ length: lines }, (_, i) => (
        <div
          key={i}
          className="skeleton"
          style={{ height: i === 0 ? '1.1em' : '0.85em', width: widths[i % widths.length] }}
        />
      ))}
    </div>
  );
}
