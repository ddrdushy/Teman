import { desc, eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { getLocale, getTranslations, getFormatter } from 'next-intl/server';
import { db } from '@/db';
import { offer, request } from '@/db/schema';
import { personIdFromSession } from '@/auth';
import { EmptyState } from '@/components/EmptyState';
import { OfferList } from './OfferList';

/* G5/G6 · My offers, by state, with withdraw on pending ones. */
export default async function MyOffersPage() {
  const locale = await getLocale();
  const personId = await personIdFromSession();
  if (!personId) redirect(`/${locale}`);
  const t = await getTranslations('offer');
  const format = await getFormatter();

  const rows = await db.select({
    id: offer.id, state: offer.state, message: offer.message, createdAt: offer.createdAt,
    title: request.title, startsAt: request.startsAt, requestId: request.id,
    requestStatus: request.status,
  }).from(offer)
    .innerJoin(request, eq(offer.requestId, request.id))
    .where(eq(offer.temanId, personId))
    .orderBy(desc(offer.createdAt))
    .limit(50);

  return (
    <main className="screen-pad" style={{ display: 'grid', gap: 'var(--s-4)' }}>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.5em', margin: 0 }}>{t('mineTitle')}</h1>
      {rows.length === 0 ? (
        <EmptyState title={t('mineEmptyTitle')} body={t('mineEmptyBody')} />
      ) : (
        <OfferList
          rows={rows.map((r) => ({
            id: r.id,
            state: r.state,
            title: r.title,
            when: format.dateTime(r.startsAt, { weekday: 'long', hour: 'numeric', minute: '2-digit' }),
            matchLive: r.state === 'accepted' && ['matched', 'active'].includes(r.requestStatus),
          }))}
        />
      )}
    </main>
  );
}
