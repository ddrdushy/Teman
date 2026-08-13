import { desc, eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { db } from '@/db';
import { circle, area, person } from '@/db/schema';
import { requireRole } from '@/lib/admin';
import { CircleApproval } from './CircleApproval';

/* N17 · Circle approval and management. */
export default async function AdminCirclesPage() {
  const locale = await getLocale();
  const actor = await requireRole(['coordinator', 'admin']);
  if (!actor) redirect(`/${locale}`);
  const t = await getTranslations('admin');

  const rows = await db.select({
    id: circle.id, name: circle.name, status: circle.status,
    joinPolicy: circle.joinPolicy, areaName: area.name,
    creatorName: person.displayName, createdAt: circle.createdAt,
  }).from(circle)
    .leftJoin(area, eq(circle.areaId, area.id))
    .leftJoin(person, eq(circle.createdBy, person.id))
    .orderBy(desc(circle.createdAt));

  return (
    <div style={{ maxWidth: '720px', display: 'grid', gap: '12px' }}>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: '24px', margin: 0 }}>{t('circ.title')}</h1>
      {rows.length === 0 && <p style={{ color: 'var(--n-700)' }}>{t('circ.empty')}</p>}
      {rows.map((c) => (
        <div key={c.id} className="card">
          <p style={{ margin: 0, fontWeight: 600 }}>{c.name}</p>
          <p style={{ margin: '3px 0 8px', fontSize: '14px', color: 'var(--n-700)' }}>
            {c.areaName ?? '—'} · {c.creatorName ?? '—'} · {c.joinPolicy}
            {' · '}
            <span className={`pill ${c.status === 'active' ? 'pill-completed' : 'pill-looking'}`}>
              {t(`circ.status.${c.status}` as never)}
            </span>
          </p>
          {c.status === 'pending' && <CircleApproval circleId={c.id} />}
        </div>
      ))}
    </div>
  );
}
