import { and, desc, eq, or } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { getLocale, getTranslations, getFormatter } from 'next-intl/server';
import { db } from '@/db';
import { session, match, request } from '@/db/schema';
import { personIdFromSession } from '@/auth';
import { Sisi } from '@/components/Sisi';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';

/* J5 · Your Teman Moments — a history, counted, never scored. */
export default async function MomentsPage() {
  const locale = await getLocale();
  const personId = await personIdFromSession();
  if (!personId) redirect(`/${locale}`);
  const t = await getTranslations('people');
  const format = await getFormatter();

  const rows = await db.select({
    endedAt: session.endedAt, title: request.title,
  }).from(session)
    .innerJoin(match, eq(session.matchId, match.id))
    .innerJoin(request, eq(match.requestId, request.id))
    .where(and(eq(session.state, 'ended'),
      or(eq(match.temanId, personId), eq(request.requesterId, personId))))
    .orderBy(desc(session.endedAt))
    .limit(50);

  return (
    <main className="screen-pad" style={{ display: 'grid', gap: 'var(--s-4)' }}>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.5em', margin: 0 }}>
        {t('momentsTitle', { count: rows.length })}
      </h1>
      {rows.length === 0 ? (
        <EmptyState title={t('momentsEmptyTitle')} body={t('momentsEmptyBody')} />
      ) : (
        <div className="stack">
          {rows.map((r, i) => (
            <Card key={i}>
              <div style={{ display: 'flex', gap: '0.7em', alignItems: 'center' }}>
                <Sisi state="moment" size={26} />
                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: 0, fontWeight: 600 }}>{r.title}</p>
                  {r.endedAt && (
                    <p className="card-meta" style={{ margin: 0 }}>
                      {format.dateTime(r.endedAt, { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
