import type { ReactNode } from 'react';

/** Native <details> so it works without JS and reads correctly to a screen
 *  reader. For guidelines, FAQ, safety, privacy. */
export function Accordion({ summary, children, open }: {
  summary: string;
  children: ReactNode;
  open?: boolean;
}) {
  return (
    <details className="accordion" open={open}>
      <summary>
        {summary}
        <span className="acc-mark" aria-hidden="true">+</span>
      </summary>
      <div className="acc-body">{children}</div>
    </details>
  );
}
