'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';

type Props = {
  message: string;
  onUndo?: () => void;
  onDismiss: () => void;
};

/** For reversible actions — beats a blocking confirm. Stays 8 seconds, not
 *  the usual 3: a toast that vanished before it was read never existed.
 *  role="status" keeps it persistent for screen readers. */
export function Toast({ message, onUndo, onDismiss }: Props) {
  const t = useTranslations('ui');
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    timer.current = setTimeout(onDismiss, 8000);
    return () => clearTimeout(timer.current);
  }, [onDismiss]);

  return createPortal(
    <div className="toast" role="status">
      <b>{message}</b>
      {onUndo && (
        <button
          type="button"
          className="toast-undo"
          onClick={() => { clearTimeout(timer.current); onUndo(); onDismiss(); }}
        >
          {t('undo')}
        </button>
      )}
    </div>,
    document.body,
  );
}
