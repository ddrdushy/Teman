'use client';

import { useTranslations } from 'next-intl';

type Props = {
  title: string;
  sub?: string;
  checked: boolean;
  onChange: (next: boolean) => void;
};

/** 62×36 — larger than the platform default because thumbs are imprecise.
 *  Carries ON/OFF words, so state never rests on position and colour alone. */
export function Switch({ title, sub, checked, onChange }: Props) {
  const t = useTranslations('ui');
  return (
    <div className="switch-row">
      <span className="sw-text">
        <span className="sw-title">{title}</span>
        {sub && <span className="sw-sub">{sub}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={title}
        className="toggle"
        onClick={() => onChange(!checked)}
      >
        <span className="tg-on" aria-hidden="true">{t('on')}</span>
        <span className="tg-off" aria-hidden="true">{t('off')}</span>
      </button>
    </div>
  );
}
