'use client';

import { useEffect, useState } from 'react';

/** Profile completeness. Fills over 700ms on mount — the one place a small
 *  reveal is justified, because progress is the message. Always paired with
 *  the number; never a bare bar. */
export function ProgressRing({ percent, label }: { percent: number; label: string }) {
  const r = 33;
  const c = 2 * Math.PI * r;
  const [offset, setOffset] = useState(c);

  useEffect(() => {
    const id = requestAnimationFrame(() =>
      setOffset(c - (Math.min(100, Math.max(0, percent)) / 100) * c),
    );
    return () => cancelAnimationFrame(id);
  }, [percent, c]);

  return (
    <span className="ring" role="img" aria-label={label}>
      <svg width="76" height="76" aria-hidden="true">
        <circle className="ring-track" cx="38" cy="38" r={r} fill="none" strokeWidth="8" />
        <circle
          className="ring-fill"
          cx="38" cy="38" r={r} fill="none" strokeWidth="8" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={offset}
        />
      </svg>
      <span className="ring-value" aria-hidden="true">{Math.round(percent)}%</span>
    </span>
  );
}
