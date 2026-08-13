import { eq } from 'drizzle-orm';
import { notFound, redirect } from 'next/navigation';
import { getLocale, getTranslations, getFormatter } from 'next-intl/server';
import { db } from '@/db';
import { recurring, person } from '@/db/schema';
import { personIdFromSession } from '@/auth';
import { Card } from '@/components/Card';
import { Pill, type PillVariant } from '@/components/Pill';
import { RecurringActions } from './RecurringActions';

/* K4/K5 · A recurring arrangement — schedule, next date, pause, end.
   Ending never asks for a reason. */
export default async function RecurringPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id } = await params;
  const locale = await getLocale();
  const personId = await personIdFromSession();
  if (!personId) redirect(`/${locale}`);
  const t = await getTranslations('community');
  const format = await getFormatter();

  const r = await db.query.recurring.findFirst({ where: eq(recurring.id, id) });
  if (!r) notFound();
  if (personId !== r.requesterId && personId !== r.temanId) notFound();

  const other = await db.query.person.findFirst({
    where: eq(person.id, personId === r.requesterId ? r.temanId : r.requesterId),
    columns: { displayName: true },
  });

  const PILL: Record<string, PillVariant> = {
    proposed: 'looking', active: 'matched', paused: 'neutral', ended: 'neutral',
  };

  return (
    <main className="screen-pad" style={{ display: 'grid', gap: 'var(--s-4)' }}>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.5em', margin: 0 }}>{r.title}</h1>
      <Card>
        <p style={{ margin: 0 }}>
          {t('recurringWith', { name: other?.displayName.split(/\s+/)[0] ?? '' })}
        </p>
        <p className="card-meta" style={{ margin: '0.3em 0 0' }}>
          {t(`freq.${r.frequency}`)} · {r.timeOfDay}
        </p>
        {r.nextDate && r.state === 'active' && (
          <p className="card-meta" style={{ margin: '0.2em 0 0' }}>
            {t('nextDate', { date: format.dateTime(r.nextDate, { weekday: 'long', day: 'numeric', month: 'long' }) })}
          </p>
        )}
        <p style={{ margin: '0.5em 0 0' }}>
          <Pill variant={PILL[r.state] ?? 'neutral'}>{t(`recState.${r.state}` as never)}</Pill>
        </p>
      </Card>
      <RecurringActions id={r.id} state={r.state} iProposed={personId === r.proposedBy} />
      <p className="field-hint" style={{ margin: 0 }}>{t('endNoReason')}</p>
    </main>
  );
}
