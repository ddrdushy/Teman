'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';
import { Button } from './Button';

type Props = {
  title: string;
  open: boolean;
  onClose: () => void;
  /** false for safety sheets — no scrim-tap, no Escape */
  dismissible?: boolean;
  children: ReactNode;
};

/** Bottom sheet. Focus is trapped; Escape and the scrim close it only when
 *  dismissible; the Close control is a real button with a word, never a bare ✕. */
export function Sheet({ title, open, onClose, dismissible = true, children }: Props) {
  const t = useTranslations('ui');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const node = ref.current;
    const previous = document.activeElement as HTMLElement | null;
    node?.querySelector<HTMLElement>('button, [href], input, select, textarea')?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && dismissible) onClose();
      if (e.key === 'Tab' && node) {
        const focusables = node.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      previous?.focus();
    };
  }, [open, dismissible, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="sheet-scrim"
      onClick={(e) => { if (dismissible && e.target === e.currentTarget) onClose(); }}
    >
      <div ref={ref} className="sheet" role="dialog" aria-modal="true" aria-label={title}>
        <h2 className="sheet-title">{title}</h2>
        {children}
        <div style={{ marginTop: 'var(--s-4)' }}>
          <Button variant="ghost" size="md" onClick={onClose}>{t('close')}</Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
