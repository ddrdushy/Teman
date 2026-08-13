import Link from 'next/link';
import { eq, count } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { db } from '@/db';
import { circle, circleMember, area } from '@/db/schema';
import { personIdFromSession } from '@/auth';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';

/* K6 · Circles nearby — cards by area, member counts (counts, not scores). */
export default async function CirclesPage() {
  const locale = await getLocale();
  const personId = await personIdFromSession();
  if (!personId) redirect(`/${locale}`);
  const t = await getTranslations('community');

  const rows = await db.select({
    id: circle.id, name: circle.name, joinPolicy: circle.joinPolicy,
    areaName: area.name, members: count(circleMember.personId),
  }).from(circle)
    .leftJoin(area, eq(circle.areaId, area.id))
    .leftJoin(circleMember, eq(circleMember.circleId, circle.id))
    .where(eq(circle.status, 'active'))
    .groupBy(circle.id, area.name);

  return (
    <main className="screen-pad" style={{ display: 'grid', gap: 'var(--s-4)' }}>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.5em', margin: 0 }}>{t('circlesTitle')}</h1>
      <p style={{ color: 'var(--n-700)', margin: 0 }}>{t('circlesLead')}</p>
      {rows.length === 0 ? (
        <EmptyState
          illustration="none"
          title={t('circlesEmptyTitle')}
          body={t('circlesEmptyBody')}
          action={
            <Link href={`/${locale}/circles/new`} className="btn btn-primary btn-lg" style={{ textDecoration: 'none' }}>
              {t('createCircle')}
            </Link>
          }
        />
      ) : (
        <>
          <div className="stack">
            {rows.map((c) => (
              <Link key={c.id} href={`/${locale}/circles/${c.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <Card title={c.name}
                  meta={`${c.areaName ?? ''} · ${t('memberCount', { count: c.members })}`} />
              </Link>
            ))}
          </div>
          <Link href={`/${locale}/circles/new`} className="btn btn-ghost btn-lg" style={{ textDecoration: 'none' }}>
            {t('createCircle')}
          </Link>
        </>
      )}
    </main>
  );
}
