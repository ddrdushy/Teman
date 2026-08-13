import type { HTMLAttributes, ReactNode } from 'react';

type Props = {
  title?: string;
  meta?: string;
  /** `connection` draws the amber edge — ONLY when a person has answered.
   *  `waiting` uses the neutral edge for the same card before anyone has.
   *  Omit for a plain card. Amber as decoration is the bug. */
  accent?: 'connection' | 'waiting';
  children?: ReactNode;
} & HTMLAttributes<HTMLDivElement>;

export function Card({ title, meta, accent, className, children, ...rest }: Props) {
  const accentClass =
    accent === 'connection' ? 'card-accent-connection'
    : accent === 'waiting' ? 'card-accent-none'
    : '';
  return (
    <div {...rest} className={['card', accentClass, className ?? ''].join(' ').trim()}>
      {title && <h3 className="card-title">{title}</h3>}
      {meta && <p className="card-meta">{meta}</p>}
      {children}
    </div>
  );
}
