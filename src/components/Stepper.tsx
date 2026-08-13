'use client';

import { useTranslations } from 'next-intl';

type Props = {
  current: number;
  total: number;
  /** quiet autosave status — there is no explicit save button in stepped flows */
  saved?: boolean;
};

/** Progress in words, not just dots: "Step 3 of 7". Never auto-advances —
 *  a screen that moves on its own is a screen that was never read. */
export function Stepper({ current, total, saved }: Props) {
  const t = useTranslations('ui');
  return (
    <div className="stepper">
      <div className="stepper-row">
        <span className="stepper-words">{t('stepOf', { current, total })}</span>
        {saved && <span className="stepper-saved" role="status">✓ {t('saved')}</span>}
      </div>
      <div
        className="stepper-track"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={current}
        aria-label={t('stepOf', { current, total })}
      >
        <div className="stepper-fill" style={{ width: `${(current / total) * 100}%` }} />
      </div>
    </div>
  );
}
