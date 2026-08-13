import { and, eq, gt, or } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { getLocale, getTranslations, getFormatter } from 'next-intl/server';
import { db } from '@/db';
import { request, match, availability, recurring } from '@/db/schema';
import { personIdFromSession } from '@/auth';
import { Calendar } from '@/components/Calendar';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';

/* K11 · Your commitments — month grid (amber dot = a confirmed Teman that
   day) plus the agenda list, which is the guaranteed-size tap route. */
export default async function CalendarPage() {
  const locale = await getLocale();
  const personId = await personIdFromSession();
  if (!personId) redirect(`/${locale}`);
  const t = await getTranslations('community');
  const format = await getFormatter();

  const matched = await db.select({
    title: request.title, startsAt: request.startsAt, status: request.status, id: request.id,
  }).from(request)
    .leftJoin(match, eq(match.requestId, request.id))
    .where(and(
      gt(request.startsAt, new Date(Date.now() - 24 * 3600_000)),
      or(eq(request.requesterId, personId), eq(match.temanId, personId)),
    ))
    .limit(60);

  const slots = await db.query.availability.findMany({
    where: and(eq(availability.personId, personId), gt(availability.endsAt, new Date())),
  });
  const recs = await db.query.recurring.findMany({
    where: and(eq(recurring.state, 'active'),
      or(eq(recurring.requesterId, personId), eq(recurring.temanId, personId))),
  });

  const temanDays = matched
    .filter((r) => ['matched', 'active', 'completed'].includes(r.status))
    .map((r) => r.startsAt.toISOString().slice(0, 10));

  const month = `${new Date().toISOString().slice(0, 7)}-01`;
  const agenda = matched
    .filter((r) => ['matched', 'active'].includes(r.status))
    .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());

  return (
    <main className="screen-pad" style={{ display: 'grid', gap: 'var(--s-4)' }}>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.5em', margin: 0 }}>{t('calendarTitle')}</h1>
      <Calendar month={month} temanDays={temanDays} />
      {agenda.length === 0 && slots.length === 0 && recs.length === 0 ? (
        <EmptyState title={t('calendarEmptyTitle')} body={t('calendarEmptyBody')} />
      ) : (
        <div className="stack">
          {agenda.map((r) => (
            <Card key={r.id} accent="connection" title={r.title}
              meta={format.dateTime(r.startsAt, { weekday: 'long', day: 'numeric', month: 'long', hour: 'numeric', minute: '2-digit' })} />
          ))}
          {recs.map((r) => (
            <Card key={r.id} title={r.title}
              meta={`${t(`freq.${r.frequency}`)} · ${r.timeOfDay}`} />
          ))}
          {slots.filter((s) => !s.destinationPoint).map((s) => (
            <Card key={s.id} accent="waiting" title={t('availabilityCard')}
              meta={format.dateTime(s.startsAt, { weekday: 'long', hour: 'numeric', minute: '2-digit' })} />
          ))}
        </div>
      )}
    </main>
  );
}
