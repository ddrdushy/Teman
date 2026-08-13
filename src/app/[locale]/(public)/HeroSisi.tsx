'use client';

import { useEffect, useRef, useState } from 'react';

/* The one animation the public site gets: Sisi completes on scroll — the
   brand argument made without words. Reduced motion renders it complete. */
export function HeroSisi({ missingLabel, thereLabel }: {
  missingLabel: string;
  thereLabel: string;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDone(true);
      return;
    }
    const onScroll = () => setDone(window.scrollY > 80);
    addEventListener('scroll', onScroll, { passive: true });
    const id = setTimeout(() => setDone(true), 2600); // completes on its own, gently
    return () => { removeEventListener('scroll', onScroll); clearTimeout(id); };
  }, []);

  return (
    <figure style={{ margin: 0, display: 'grid', gap: '0.5em', justifyItems: 'start' }}>
      <svg ref={ref} width="150" height="108" viewBox="0 0 100 72" role="img" aria-label={done ? thereLabel : missingLabel}>
        <rect x="18" y="10" width="26" height="52" rx="13" fill="var(--t-900)" />
        <rect
          x="56" y="10" width="26" height="52" rx="13"
          fill={done ? 'var(--a-400)' : 'transparent'}
          stroke={done ? 'transparent' : 'var(--n-300)'}
          strokeWidth="2.5"
          strokeDasharray={done ? undefined : '6 6'}
          style={{ transition: 'fill 500ms var(--ease), stroke 500ms var(--ease)' }}
        />
      </svg>
      <figcaption style={{ font: '600 0.85em var(--sans)', color: 'var(--n-700)' }}>
        {done ? thereLabel : missingLabel}
      </figcaption>
    </figure>
  );
}
