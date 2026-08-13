import type { ReactNode } from 'react';

/* Tab-bar icons. Rounded geometry to sit beside the Sisi pills; outline when
   resting, filled when active — the active tab is never colour alone. All are
   aria-hidden: the visible label carries the meaning. */

type IconProps = { active?: boolean; size?: number };

function base(size: number) {
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.9,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true as const,
  };
}

/** A house — the home tab. */
export function IconHome({ active = false, size = 26 }: IconProps): ReactNode {
  return (
    <svg {...base(size)}>
      <path
        d="M4 10.4 12 4l8 6.4V19a1.6 1.6 0 0 1-1.6 1.6H5.6A1.6 1.6 0 0 1 4 19Z"
        fill={active ? 'currentColor' : 'none'}
      />
      {active
        ? <path d="M9.6 20.6v-5.2a1 1 0 0 1 1-1h2.8a1 1 0 0 1 1 1v5.2" stroke="var(--n-050)" fill="none" />
        : <path d="M9.6 20.6v-5.2a1 1 0 0 1 1-1h2.8a1 1 0 0 1 1 1v5.2" />}
    </svg>
  );
}

/** A written ask — sheet with lines — the requests tab. */
export function IconRequests({ active = false, size = 26 }: IconProps): ReactNode {
  return (
    <svg {...base(size)}>
      <rect x="5" y="3.6" width="14" height="16.8" rx="2.6" fill={active ? 'currentColor' : 'none'} />
      {active ? (
        <g stroke="var(--n-050)">
          <path d="M9 9h6.2" /><path d="M9 12.6h6.2" /><path d="M9 16.2h3.4" />
        </g>
      ) : (
        <g>
          <path d="M9 9h6.2" /><path d="M9 12.6h6.2" /><path d="M9 16.2h3.4" />
        </g>
      )}
    </svg>
  );
}

/** A speech bubble — the messages tab. */
export function IconMessages({ active = false, size = 26 }: IconProps): ReactNode {
  return (
    <svg {...base(size)}>
      <path
        d="M4 8a3.4 3.4 0 0 1 3.4-3.4h9.2A3.4 3.4 0 0 1 20 8v5a3.4 3.4 0 0 1-3.4 3.4H9.8L5.6 19.6a1 1 0 0 1-1.6-.8Z"
        fill={active ? 'currentColor' : 'none'}
      />
      {active ? (
        <g stroke="var(--n-050)"><path d="M8.6 9.4h6.8" /><path d="M8.6 12.6h4.2" /></g>
      ) : (
        <g><path d="M8.6 9.4h6.8" /><path d="M8.6 12.6h4.2" /></g>
      )}
    </svg>
  );
}

/** A person — the you tab. */
export function IconYou({ active = false, size = 26 }: IconProps): ReactNode {
  return (
    <svg {...base(size)}>
      <circle cx="12" cy="8" r="3.6" fill={active ? 'currentColor' : 'none'} />
      <path
        d="M5.2 20.4a6.8 6.8 0 0 1 13.6 0"
        fill={active ? 'currentColor' : 'none'}
      />
    </svg>
  );
}
