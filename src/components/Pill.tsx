import type { ReactNode } from 'react';

export type PillVariant = 'neutral' | 'looking' | 'matched' | 'live' | 'completed' | 'error';

/* Each variant pairs a glyph with its colour so state never rests on colour
   alone. Amber is deliberately not available — connection is carried by
   Sisi, not by a badge. */
const GLYPHS: Record<PillVariant, string> = {
  neutral: '·',
  looking: '◷',
  matched: '✓',
  live: '●',
  completed: '✓',
  error: '!',
};

export function Pill({ variant = 'neutral', children }: { variant?: PillVariant; children: ReactNode }) {
  return (
    <span className={`pill pill-${variant}`}>
      <span aria-hidden="true">{GLYPHS[variant]}</span>
      {children}
    </span>
  );
}
