/** Confirmation moments only. The stroke draws over 520ms — it reads as
 *  "something completed" rather than "something was already true". */
export function TickDraw({ size = 54 }: { size?: number }) {
  return (
    <svg className="tick-draw" width={size} height={size} viewBox="0 0 44 44" aria-hidden="true">
      <circle cx="22" cy="22" r="20" fill="none" stroke="var(--ok-text)" strokeWidth="2.5" />
      <path
        d="M13 22.5l6 6 12-12"
        fill="none"
        stroke="var(--ok-text)"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
