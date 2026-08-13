import Link from 'next/link';
import { desc, eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { getLocale, getTranslations, getFormatter } from 'next-intl/server';
import { db } from '@/db';
import { match, request } from '@/db/schema';
import { personIdFromSession } from '@/auth';
import { Card } from '@/components/Card';
import { Pill, type PillVariant } from '@/components/Pill';
import { EmptyState } from '@/components/EmptyState';

/* K12 · Requests you helped with — the volunteer's history. */
export default async function ActivitiesPage() {
  const locale = await getLocale();
  const personId = await personIdFromSession();
  if (!personId) redirect(`/${locale}`);
  const t = await getTranslations('community');
  const format = await getFormatter();

  const rows = await db.select({
    id: request.id, matchId: match.id, title: request.title,
    startsAt: request.startsAt, status: request.status,
  }).from(match)
    .innerJoin(request, eq(match.requestId, request.id))
    .where(eq(match.temanId, personId))
    .orderBy(desc(request.startsAt))
    .limit(50);

  const PILL: Record<string, PillVariant> = {
    matched: 'matched', active: 'live', completed: 'completed',
  };

  return (
    <main className="screen-pad" style={{ display: 'grid', gap: 'var(--s-4)' }}>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.5em', margin: 0 }}>{t('activitiesTitle')}</h1>
      {rows.length === 0 ? (
        <EmptyState title={t('activitiesEmptyTitle')} body={t('activitiesEmptyBody')} />
      ) : (
        <div className="stack">
          {rows.map((r) => (
            <Link key={r.id} href={`/${locale}/matches/${r.matchId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <Card accent={r.status === 'completed' ? undefined : 'connection'} title={r.title}
                meta={format.dateTime(r.startsAt, { weekday: 'long', day: 'numeric', month: 'long' })}>
                <p style={{ margin: '0.4em 0 0' }}>
                  <Pill variant={PILL[r.status] ?? 'neutral'}>{t(`activityStatus.${r.status}` as never)}</Pill>
                </p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
