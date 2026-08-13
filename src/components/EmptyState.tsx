import type { ReactNode } from 'react';
import { Sisi } from './Sisi';

type Props = {
  /** waiting → Sisi's unfilled form; none → no illustration */
  illustration?: 'waiting' | 'none';
  title: string;
  body: string;
  action?: ReactNode;   // usually a Button — an empty screen is an invitation
};

/** Never "No data" and never a bare canvas: one line explaining *why* it's
 *  empty, one primary action. */
export function EmptyState({ illustration = 'waiting', title, body, action }: Props) {
  return (
    <div className="empty">
      {illustration === 'waiting' && <Sisi state="waiting" size={76} />}
      <h2 className="empty-title">{title}</h2>
      <p className="empty-body">{body}</p>
      {action}
    </div>
  );
}
