import { count, eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { db } from '@/db';
import { person, area } from '@/db/schema';
import { personIdFromSession } from '@/auth';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';

/* B4 · Around You — counts only, never exact locations. Pre-launch it counts
   volunteers; request/availability counters join in M4. */
export default async function AroundPage() {
  const locale = await getLocale();
  const personId = await personIdFromSession();
  if (!personId) redirect(`/${locale}`);
  const t = await getTranslations();

  const p = await db.query.person.findFirst({ where: eq(person.id, personId) });
  if (!p?.areaId) redirect(`/${locale}/join/next`);

  const a = await db.query.area.findFirst({ where: eq(area.id, p.areaId) });
  const areaName =
    (locale === 'ms' ? a?.nameMs : locale === 'ta' ? a?.nameTa : locale === 'zh' ? a?.nameZh : a?.name) ??
    a?.name ?? '';
  const [row] = await db.select({ n: count() }).from(person).where(eq(person.areaId, p.areaId));

  return (
    <main className="screen-pad" style={{ display: 'grid', gap: 'var(--s-4)' }}>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.5em', margin: 0 }}>
        {t('home.around', { area: areaName })}
      </h1>
      {row.n > 1 ? (
        <Card>
          <p style={{ margin: 0 }}>
            <b style={{ color: 'var(--t-900)', fontSize: '1.3em' }}>{row.n}</b>{' '}
            {t('around.volunteersLine')}
          </p>
        </Card>
      ) : (
        <EmptyState title={t('around.emptyTitle')} body={t('around.emptyBody')} />
      )}
    </main>
  );
}
