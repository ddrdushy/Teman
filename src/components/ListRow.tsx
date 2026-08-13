import Link from 'next/link';
import type { ReactNode } from 'react';

type Props = {
  title: string;
  sub?: string;
  icon?: ReactNode;         // decorative — the words carry the meaning
  href?: string;            // renders a Link; otherwise a button
  onClick?: () => void;
};

/** The workhorse navigable row: settings, people, circles, contacts. The
 *  whole row is the 60px target; the chevron is decoration, never the only
 *  affordance. */
export function ListRow({ title, sub, icon, href, onClick }: Props) {
  const inner = (
    <>
      {icon && <span className="lr-icon" aria-hidden="true">{icon}</span>}
      <span className="lr-text">
        <span className="lr-title">{title}</span>
        {sub && <span className="lr-sub">{sub}</span>}
      </span>
      <span className="lr-chevron" aria-hidden="true">›</span>
    </>
  );
  return href
    ? <Link href={href} className="list-row">{inner}</Link>
    : <button type="button" className="list-row" onClick={onClick}>{inner}</button>;
}
