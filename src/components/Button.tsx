'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { useTranslations } from 'next-intl';

type Props = {
  /** `connection` is the amber-rule enforcement point: only for accepting a
   *  person or completing a Teman Moment. On a screen with no person
   *  attached, that is the bug. */
  variant?: 'primary' | 'connection' | 'ghost' | 'line' | 'danger';
  /** lg = 64px, md = 56px. There is no small. */
  size?: 'lg' | 'md';
  loading?: boolean;
  children: ReactNode;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>;

export function Button({
  variant = 'primary',
  size = 'lg',
  loading = false,
  disabled,
  className,
  children,
  ...rest
}: Props) {
  const t = useTranslations('ui');
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={[
        'btn',
        `btn-${variant}`,
        size === 'lg' ? 'btn-lg' : '',
        loading ? 'is-loading' : '',
        className ?? '',
      ].join(' ').trim()}
    >
      {/* Width is held while loading: the label goes invisible, not away. */}
      <span className="btn-label">{children}</span>
      {loading && <span className="btn-spinner" role="status" aria-label={t('loading')} />}
    </button>
  );
}
