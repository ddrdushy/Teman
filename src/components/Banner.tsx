import type { ReactNode } from 'react';

type Props = {
  variant: 'info' | 'warning' | 'success' | 'error';
  title?: string;
  children: ReactNode;   // the body — explains what happened and what to do next
  action?: ReactNode;    // usually a Button
};

const ICONS = { info: 'ℹ', warning: '◷', success: '✓', error: '!' } as const;

/** Inline message. Errors explain what happened and what to do next, in the
 *  interface's voice — they don't apologise and they're never vague. */
export function Banner({ variant, title, children, action }: Props) {
  return (
    <div className={`banner banner-${variant}`} role={variant === 'error' ? 'alert' : 'status'}>
      <span className="banner-icon" aria-hidden="true">{ICONS[variant]}</span>
      <div>
        {title && <span className="banner-title">{title}</span>}
        <span className="banner-body">{children}</span>
        {action}
      </div>
    </div>
  );
}
