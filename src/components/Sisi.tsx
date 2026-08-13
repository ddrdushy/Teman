/**
 * Sisi — the signature motif.
 *
 * `di sisi` (Malay): by your side.
 *
 * Two presence forms. You, solid — and the space beside you. That space is
 * dashed and empty until someone answers, then it fills with amber. The brand
 * mark completes itself at the moment the product works.
 *
 * This is the most-reused element in the app. It is also the enforcement point
 * for the amber rule: if amber appears on a screen with no person attached,
 * that's the bug.
 *
 * The shape is always aria-hidden. State is carried by the adjacent text,
 * because a shape is never the sole signal.
 */

export type SisiState =
  | 'waiting'   // request published, nobody yet
  | 'answered'  // someone offered — amber's first appearance in a flow
  | 'together'  // session live
  | 'moment';   // completed — the only badge the product gives

type Props = {
  state: SisiState;
  /** 24 (notification) · 26 (inline) · 76 (card) · 118 (hero) */
  size?: number;
  /** 'dark' when sitting on a Teal 900 panel */
  tone?: 'light' | 'dark';
  className?: string;
};

const RATIO = 72 / 100;

export function Sisi({ state, size = 76, tone = 'light', className }: Props) {
  const dark = tone === 'dark';

  // left form — you  (all colours resolve through tokens.css)
  const left = state === 'moment' ? 'var(--a-300)' : dark ? 'var(--n-050)' : 'var(--t-900)';

  // right form — the space beside you
  const rightFill =
    state === 'waiting' ? 'transparent' : state === 'moment' ? 'var(--a-300)' : 'var(--a-400)';
  const rightStroke =
    state === 'waiting' ? (dark ? 'var(--sisi-dash-dark)' : 'var(--n-300)') : 'transparent';

  // the join — only once they are actually together
  const joined = state === 'together' || state === 'moment';
  const joinFill = state === 'moment' ? 'var(--a-300)' : 'var(--t-800)';

  return (
    <svg
      className={className}
      width={size}
      height={Math.round(size * RATIO)}
      viewBox="0 0 100 72"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="20" y="14" width="24" height="46" rx="12" fill={left} />
      <rect
        x="56"
        y="14"
        width="24"
        height="46"
        rx="12"
        fill={rightFill}
        stroke={rightStroke}
        strokeWidth="2.5"
        strokeDasharray={state === 'waiting' ? '5 5' : undefined}
        style={{
          transition: 'fill var(--dur-base) var(--ease), stroke var(--dur-base) var(--ease)',
        }}
      />
      {joined && <rect x="38" y="30" width="24" height="8" rx="4" fill={joinFill} />}
    </svg>
  );
}

/**
 * App icon and notification mark. Always the *answered* state — an invitation,
 * not a vacancy. Minimum 24px.
 */
export function SisiMark({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 92 92" aria-hidden="true" focusable="false">
      <rect width="92" height="92" rx="21" fill="var(--t-900)" />
      <rect x="24" y="24" width="17" height="44" rx="8.5" fill="var(--n-050)" />
      <rect x="51" y="24" width="17" height="44" rx="8.5" fill="var(--a-400)" />
    </svg>
  );
}

/** Wordmark. Default position is top-left; clear space is one bar width. */
export function TemanLogo({ height = 30, onDark = false }: { height?: number; onDark?: boolean }) {
  return (
    <svg
      height={height}
      viewBox="0 0 180 46"
      role="img"
      aria-label="Teman"
      style={{ display: 'block' }}
    >
      <rect x="4" y="8" width="12" height="30" rx="6" fill={onDark ? 'var(--n-050)' : 'var(--t-900)'} />
      <rect x="22" y="8" width="12" height="30" rx="6" fill="var(--a-400)" />
      <text
        x="46"
        y="34"
        fontFamily="Vollkorn, Georgia, serif"
        fontSize="32"
        fontWeight="700"
        fill={onDark ? 'var(--white)' : 'var(--t-900)'}
      >
        Teman
      </text>
    </svg>
  );
}
