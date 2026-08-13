import Link from 'next/link';
import { and, desc, eq, gt, isNotNull } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { getLocale, getTranslations, getFormatter } from 'next-intl/server';
import { db } from '@/db';
import { availability } from '@/db/schema';
import { personIdFromSession } from '@/auth';
import { EmptyState } from '@/components/EmptyState';
import { ListRow } from '@/components/ListRow';

/* F5/F6 entry · Your journeys — availability rows with a destination. */
export default async function JourneyPage() {
  const locale = await getLocale();
  const personId = await personIdFromSession();
  if (!personId) redirect(`/${locale}`);
  const t = await getTranslations('journey');
  const format = await getFormatter();

  const rows = await db.query.availability.findMany({
    where: and(
      eq(availability.personId, personId),
      isNotNull(availability.destinationPoint),
      gt(availability.endsAt, new Date()),
    ),
    orderBy: desc(availability.startsAt),
  });

  return (
    <main className="screen-pad" style={{ display: 'grid', gap: 'var(--s-4)' }}>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.5em', margin: 0 }}>{t('title')}</h1>
      <p style={{ color: 'var(--n-700)', margin: 0 }}>{t('lead')}</p>
      {rows.length === 0 ? (
        <EmptyState
          title={t('emptyTitle')}
          body={t('emptyBody')}
          action={
            <Link href={`/${locale}/journey/new`} className="btn btn-primary btn-lg" style={{ textDecoration: 'none' }}>
              {t('addCta')}
            </Link>
          }
        />
      ) : (
        <>
          <div className="stack">
            {rows.map((r) => (
              <ListRow
                key={r.id}
                href={`/${locale}/journey/${r.id}`}
                icon="→"
                title={format.dateTime(r.startsAt, { weekday: 'long', day: 'numeric', month: 'long' })}
                sub={`${format.dateTime(r.startsAt, { hour: 'numeric', minute: '2-digit' })} – ${format.dateTime(r.endsAt, { hour: 'numeric', minute: '2-digit' })}`}
              />
            ))}
          </div>
          <Link href={`/${locale}/journey/new`} className="btn btn-primary btn-lg" style={{ textDecoration: 'none' }}>
            {t('addCta')}
          </Link>
        </>
      )}
    </main>
  );
}
