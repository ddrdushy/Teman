import { desc, eq, isNotNull } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { db } from '@/db';
import { request, person } from '@/db/schema';
import { requireRole } from '@/lib/admin';
import { FlaggedActions } from './FlaggedActions';

/* N15 · Flagged requests — the triage FLAGGED them; a person decides. */
export default async function FlaggedRequestsPage() {
  const locale = await getLocale();
  const actor = await requireRole(['admin']);
  if (!actor) redirect(`/${locale}/admin`);
  const t = await getTranslations('admin');

  const rows = await db.select({
    id: request.id, title: request.title, description: request.description,
    flaggedReason: request.flaggedReason, status: request.status,
    createdAt: request.createdAt, requesterName: person.displayName,
  }).from(request)
    .innerJoin(person, eq(request.requesterId, person.id))
    .where(isNotNull(request.flaggedReason))
    .orderBy(desc(request.createdAt))
    .limit(50);

  const fmt = new Intl.DateTimeFormat(locale, { dateStyle: 'medium' });

  return (
    <div style={{ display: 'grid', gap: '14px', maxWidth: '720px' }}>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: '24px', margin: 0 }}>{t('flag.title')}</h1>
      {rows.length === 0 && <p style={{ color: 'var(--n-700)' }}>{t('flag.empty')}</p>}
      {rows.map((r) => (
        <div key={r.id} className="card">
          <p style={{ margin: 0, fontWeight: 600 }}>{r.title}</p>
          {r.description && <p style={{ margin: '4px 0', fontSize: '14px' }}>“{r.description}”</p>}
          <p style={{ margin: '4px 0', fontSize: '13px', color: 'var(--n-700)' }}>
            {r.requesterName} · {fmt.format(r.createdAt)} · {r.status}
          </p>
          <p style={{ margin: '4px 0 8px' }}>
            {(r.flaggedReason ?? '').split(',').map((f) => (
              <span key={f} className="pill pill-error" style={{ marginInlineEnd: 6 }}>{t(`flag.reason.${f}` as never)}</span>
            ))}
          </p>
          {r.status === 'looking' && <FlaggedActions requestId={r.id} />}
        </div>
      ))}
    </div>
  );
}
