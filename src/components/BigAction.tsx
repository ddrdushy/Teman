'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Props = {
  icon: ReactNode;          // a Sisi variant at 26px, always decorative
  title: string;            // caller passes t('…') — never a literal
  subtitle?: string;
  variant?: 'primary' | 'ghost';
} & ButtonHTMLAttributes<HTMLButtonElement>;

/** The home-screen action. Never width-constrained to the English label —
 *  Malay and Tamil run ~20% longer and wrap inside ba-text. */
export function BigAction({ icon, title, subtitle, variant = 'primary', className, ...rest }: Props) {
  return (
    <button {...rest} className={['big-action', `big-action-${variant}`, className ?? ''].join(' ').trim()}>
      <span aria-hidden="true">{icon}</span>
      <span className="ba-text">
        {title}
        {subtitle && <span className="ba-sub">{subtitle}</span>}
      </span>
    </button>
  );
}
