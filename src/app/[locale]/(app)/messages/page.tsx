import Link from 'next/link';
import { desc, eq, or, and, inArray } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { getLocale, getTranslations, getFormatter } from 'next-intl/server';
import { db } from '@/db';
import { match, request, person, message } from '@/db/schema';
import { personIdFromSession } from '@/auth';
import { EmptyState } from '@/components/EmptyState';
import { ListRow } from '@/components/ListRow';

/* H4 · Threads — scoped to matched requests only. The empty state says why
   it's empty: messages appear after a match. */
export default async function MessagesPage() {
  const locale = await getLocale();
  const personId = await personIdFromSession();
  if (!personId) redirect(`/${locale}`);
  const t = await getTranslations('coord');
  const format = await getFormatter();

  const matches = await db.select({
    matchId: match.id, requestId: request.id, title: request.title,
    status: request.status, requesterId: request.requesterId, temanId: match.temanId,
  }).from(match)
    .innerJoin(request, eq(match.requestId, request.id))
    .where(or(eq(request.requesterId, personId), eq(match.temanId, personId)))
    .orderBy(desc(request.startsAt))
    .limit(30);

  const otherIds = matches.map((m) => (m.requesterId === personId ? m.temanId : m.requesterId));
  const people = otherIds.length
    ? await db.query.person.findMany({ where: inArray(person.id, otherIds), columns: { id: true, displayName: true } })
    : [];
  const nameOf = new Map(people.map((p) => [p.id, p.displayName]));

  return (
    <main className="screen-pad" style={{ display: 'grid', gap: 'var(--s-4)' }}>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.5em', margin: 0 }}>{t('threadsTitle')}</h1>
      {matches.length === 0 ? (
        <EmptyState title={t('threadsEmptyTitle')} body={t('threadsEmptyBody')} />
      ) : (
        <div className="stack">
          {matches.map((m) => {
            const otherId = m.requesterId === personId ? m.temanId : m.requesterId;
            const name = nameOf.get(otherId) ?? '';
            return (
              <ListRow
                key={m.matchId}
                href={`/${locale}/messages/${m.requestId}`}
                icon={name.charAt(0)}
                title={name}
                sub={m.title}
              />
            );
          })}
        </div>
      )}
    </main>
  );
}
