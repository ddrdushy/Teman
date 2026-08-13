import Link from 'next/link';
import { and, eq, gt } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { getLocale, getTranslations, getFormatter } from 'next-intl/server';
import { db } from '@/db';
import { person, availability, category } from '@/db/schema';
import { personIdFromSession } from '@/auth';
import { discoverRequests } from '@/lib/matching';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';

/* G1 · Requests near you, ranked by the one discovery query. Empty state
   points at availability — the fix is telling us when you're free. */
export default async function NearbyPage() {
  const locale = await getLocale();
  const personId = await personIdFromSession();
  if (!personId) redirect(`/${locale}`);
  const t = await getTranslations('nearby');
  const format = await getFormatter();

  const me = await db.query.person.findFirst({ where: eq(person.id, personId) });
  if (!me?.areaId) redirect(`/${locale}/join/next`);

  const slots = await db.query.availability.findMany({
    where: and(eq(availability.personId, personId), eq(availability.isActive, true),
      gt(availability.endsAt, new Date())),
  });

  let rows: Awaited<ReturnType<typeof discoverRequests>> = [];
  for (const slot of slots.slice(0, 5)) {
    const found = await discoverRequests({
      temanId: personId,
      centreWkt: slot.centrePoint,
      radiusM: slot.radiusM,
      availStart: slot.startsAt,
      availEnd: slot.endsAt,
      categories: slot.categories ?? [],
      temanLanguages: me.languages ?? [],
      temanVerified: ['identity', 'community', 'enhanced'].includes(me.verificationTier),
      destinationWkt: slot.destinationPoint,
    });
    for (const f of found) if (!rows.some((x) => x.id === f.id)) rows.push(f);
  }

  const cats = await db.select().from(category);
  const catName = new Map(cats.map((c) => [c.id,
    (locale === 'ms' ? c.nameMs : locale === 'ta' ? c.nameTa : locale === 'zh' ? c.nameZh : c.nameEn) ?? c.nameEn,
  ]));

  return (
    <main className="screen-pad" style={{ display: 'grid', gap: 'var(--s-4)' }}>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.5em', margin: 0 }}>{t('title')}</h1>
      {slots.length === 0 ? (
        <EmptyState
          title={t('noAvailabilityTitle')}
          body={t('noAvailabilityBody')}
          action={
            <Link href={`/${locale}/available/new`} className="btn btn-primary btn-lg" style={{ textDecoration: 'none' }}>
              {t('setAvailability')}
            </Link>
          }
        />
      ) : rows.length === 0 ? (
        <EmptyState title={t('noneTitle')} body={t('noneBody')} />
      ) : (
        <div className="stack">
          {rows.map((r) => (
            <Link key={r.id} href={`/${locale}/nearby/${r.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <Card
                accent="waiting"
                title={r.title}
                meta={`${format.dateTime(new Date(r.startsAt), { weekday: 'long', hour: 'numeric', minute: '2-digit' })} · ${t('kmAway', { km: (r.metres / 1000).toFixed(1) })}`}
              >
                <p className="card-meta" style={{ margin: '0.3em 0 0' }}>
                  {catName.get(r.categoryId) ?? ''}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
