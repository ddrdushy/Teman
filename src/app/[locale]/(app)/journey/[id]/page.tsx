import Link from 'next/link';
import { and, eq } from 'drizzle-orm';
import { notFound, redirect } from 'next/navigation';
import { getLocale, getTranslations, getFormatter } from 'next-intl/server';
import { db } from '@/db';
import { availability, person, category } from '@/db/schema';
import { personIdFromSession } from '@/auth';
import { discoverRequests } from '@/lib/matching';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';

/* F6 · Overlaps found — requests near the destination around the same time.
   Both sides are notified of possibilities; neither is auto-matched. */
export default async function JourneyOverlapsPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id } = await params;
  const locale = await getLocale();
  const personId = await personIdFromSession();
  if (!personId) redirect(`/${locale}`);
  const t = await getTranslations('journey');
  const format = await getFormatter();

  const j = await db.query.availability.findFirst({
    where: and(eq(availability.id, id), eq(availability.personId, personId)),
  });
  if (!j || !j.destinationPoint) notFound();

  const me = await db.query.person.findFirst({ where: eq(person.id, personId) });

  /* centred on the DESTINATION — the whole point of a journey */
  const rows = await discoverRequests({
    temanId: personId,
    centreWkt: j.destinationPoint,
    radiusM: 3000,
    availStart: j.startsAt,
    availEnd: j.endsAt,
    categories: [],
    temanLanguages: me?.languages ?? [],
    temanVerified: ['identity', 'community', 'enhanced'].includes(me?.verificationTier ?? ''),
    destinationWkt: j.destinationPoint,
  });

  const cats = await db.select().from(category);
  const catName = new Map(cats.map((c) => [c.id,
    (locale === 'ms' ? c.nameMs : locale === 'ta' ? c.nameTa : locale === 'zh' ? c.nameZh : c.nameEn) ?? c.nameEn,
  ]));

  return (
    <main className="screen-pad" style={{ display: 'grid', gap: 'var(--s-4)' }}>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.5em', margin: 0 }}>{t('overlapTitle')}</h1>
      <p style={{ color: 'var(--n-700)', margin: 0 }}>
        {format.dateTime(j.startsAt, { weekday: 'long', day: 'numeric', month: 'long' })}
        {' · '}
        {format.dateTime(j.startsAt, { hour: 'numeric', minute: '2-digit' })}
        –{format.dateTime(j.endsAt, { hour: 'numeric', minute: '2-digit' })}
      </p>
      {rows.length === 0 ? (
        <EmptyState title={t('noneTitle')} body={t('noneBody')} />
      ) : (
        <div className="stack">
          {rows.map((r) => (
            <Link key={r.id} href={`/${locale}/nearby/${r.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <Card accent="waiting" title={r.title}
                meta={`${format.dateTime(new Date(r.startsAt), { hour: 'numeric', minute: '2-digit' })} · ${catName.get(r.categoryId) ?? ''}`}>
                <p className="card-meta" style={{ margin: '0.3em 0 0' }}>{t('sameWay')}</p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
