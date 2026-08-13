import Link from 'next/link';
import { desc, eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { db } from '@/db';
import { availability } from '@/db/schema';
import { personIdFromSession } from '@/auth';
import { EmptyState } from '@/components/EmptyState';
import { SlotList } from './SlotList';

/* F3 · Your availability — upcoming slots, editable, deletable (with undo). */
export default async function AvailabilityListPage() {
  const locale = await getLocale();
  const personId = await personIdFromSession();
  if (!personId) redirect(`/${locale}`);
  const t = await getTranslations('avail');

  const rows = await db.query.availability.findMany({
    where: eq(availability.personId, personId),
    orderBy: desc(availability.startsAt),
    limit: 20,
  });

  return (
    <main className="screen-pad" style={{ display: 'grid', gap: 'var(--s-4)' }}>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.5em', margin: 0 }}>{t('listTitle')}</h1>
      {rows.length === 0 ? (
        <EmptyState
          title={t('emptyTitle')}
          body={t('emptyBody')}
          action={
            <Link href={`/${locale}/available/new`} className="btn btn-primary btn-lg" style={{ textDecoration: 'none' }}>
              {t('addCta')}
            </Link>
          }
        />
      ) : (
        <>
          <SlotList
            slots={rows.map((r) => ({
              id: r.id,
              startsAt: r.startsAt.toISOString(),
              endsAt: r.endsAt.toISOString(),
              radiusM: r.radiusM,
              repeatsWeekly: r.repeatsWeekly,
              categoriesCount: r.categories?.length ?? 0,
            }))}
          />
          <Link href={`/${locale}/available/new`} className="btn btn-primary btn-lg" style={{ textDecoration: 'none' }}>
            {t('addCta')}
          </Link>
        </>
      )}
    </main>
  );
}
