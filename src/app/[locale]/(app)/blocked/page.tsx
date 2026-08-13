import { eq, inArray } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { db } from '@/db';
import { block, person } from '@/db/schema';
import { personIdFromSession } from '@/auth';
import { EmptyState } from '@/components/EmptyState';
import { BlockedList } from './BlockedList';

/* I13 · Blocked people — mutual invisibility, undoable here. */
export default async function BlockedPage() {
  const locale = await getLocale();
  const personId = await personIdFromSession();
  if (!personId) redirect(`/${locale}`);
  const t = await getTranslations('safety');

  const rows = await db.query.block.findMany({ where: eq(block.blockerId, personId) });
  const people = rows.length
    ? await db.query.person.findMany({
        where: inArray(person.id, rows.map((r) => r.blockedId)),
        columns: { id: true, displayName: true },
      })
    : [];

  return (
    <main className="screen-pad" style={{ display: 'grid', gap: 'var(--s-4)' }}>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.5em', margin: 0 }}>{t('blockedTitle')}</h1>
      {people.length === 0 ? (
        <EmptyState illustration="none" title={t('blockedEmptyTitle')} body={t('blockedEmptyBody')} />
      ) : (
        <BlockedList people={people.map((p) => ({ id: p.id, name: p.displayName }))} />
      )}
    </main>
  );
}
