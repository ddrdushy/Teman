'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

const SIZES = [
  { scale: 18, key: 'standard' },
  { scale: 22, key: 'large' },
  { scale: 26, key: 'extraLarge' },
] as const;

/** Three options, each rendered *at its own size* so the choice is visible
 *  rather than described. Persists per account; applies on top of the OS
 *  font setting. Elder view defaults to Large. */
export function TextSizeControl({ current }: { current: number }) {
  const t = useTranslations('language');
  const router = useRouter();

  async function pick(scale: number) {
    await fetch('/api/me/preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ textScale: scale }),
    });
    router.refresh();
  }

  return (
    <div className="stack" role="radiogroup" aria-label={t('textSize')}>
      {SIZES.map(({ scale, key }) => (
        <button
          key={scale}
          role="radio"
          aria-checked={current === scale}
          className={['option-row', current === scale ? 'is-selected' : ''].join(' ').trim()}
          style={{ fontSize: `${scale}px` }}
          onClick={() => pick(scale)}
        >
          <span style={{ fontWeight: 600 }}>{t(key)}</span>
          <span className="or-tick" aria-hidden="true">✓</span>
        </button>
      ))}
    </div>
  );
}
