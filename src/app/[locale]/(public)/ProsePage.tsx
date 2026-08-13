import type { ReactNode } from 'react';

/* Shared shell for the prose-led public pages: measure capped, body 18px,
   generous rhythm (docs/08). */
export function ProsePage({ title, lede, children }: {
  title: string;
  lede?: string;
  children: ReactNode;
}) {
  return (
    <main style={{ maxWidth: '720px', margin: '0 auto', padding: 'var(--s-10) var(--s-5) var(--s-14)' }}>
      <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 700, fontSize: 'clamp(1.7em, 5vw, 2.4em)', lineHeight: 1.15, margin: '0 0 0.5em', maxWidth: '20ch' }}>
        {title}
      </h1>
      {lede && (
        <p style={{ fontSize: '1.1em', color: 'var(--n-700)', lineHeight: 1.6, margin: '0 0 var(--s-6)', maxWidth: '55ch' }}>
          {lede}
        </p>
      )}
      <div style={{ display: 'grid', gap: 'var(--s-5)', lineHeight: 1.65 }}>{children}</div>
    </main>
  );
}

export function Section({ heading, children }: { heading?: string; children: ReactNode }) {
  return (
    <section style={{ display: 'grid', gap: 'var(--s-2)' }}>
      {heading && <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.3em', margin: 0 }}>{heading}</h2>}
      {children}
    </section>
  );
}
