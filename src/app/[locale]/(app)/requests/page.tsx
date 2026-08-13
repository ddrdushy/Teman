import Link from 'next/link';
import { desc, eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { db } from '@/db';
import { request, careRecipient } from '@/db/schema';
import { personIdFromSession } from '@/auth';
import { EmptyState } from '@/components/EmptyState';
import { RequestTabs } from './RequestTabs';

/* E13 · My requests — five tabs, each with its own empty state. Expired rows
   live under Cancelled with their own pill (five tabs, seven states). */
export default async function RequestsPage() {
  const locale = await getLocale();
  const personId = await personIdFromSession();
  if (!personId) redirect(`/${locale}`);
  const t = await getTranslations('req');

  const rows = await db.query.request.findMany({
    where: eq(request.requesterId, personId),
    orderBy: desc(request.startsAt),
    limit: 100,
  });
  const recipients = await db.query.careRecipient.findMany({
    where: eq(careRecipient.managedBy, personId),
    columns: { id: true, preferredName: true },
  });
  const nameOf = new Map(recipients.map((r) => [r.id, r.preferredName]));

  if (rows.length === 0) {
    return (
      <main className="screen-pad">
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.5em', margin: '0 0 var(--s-4)' }}>{t('listTitle')}</h1>
        <EmptyState
          title={t('listEmptyTitle')}
          body={t('listEmptyBody')}
          action={
            <Link href={`/${locale}/requests/new`} className="btn btn-primary btn-lg" style={{ textDecoration: 'none' }}>
              {t('newCta')}
            </Link>
          }
        />
      </main>
    );
  }

  return (
    <main className="screen-pad" style={{ display: 'grid', gap: 'var(--s-4)' }}>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.5em', margin: 0 }}>{t('listTitle')}</h1>
      <RequestTabs
        rows={rows.map((r) => ({
          id: r.id,
          title: r.title,
          status: r.status,
          startsAt: r.startsAt.toISOString(),
          forName: r.beneficiaryId ? nameOf.get(r.beneficiaryId) ?? null : null,
        }))}
      />
      <Link href={`/${locale}/requests/new`} className="btn btn-primary btn-lg" style={{ textDecoration: 'none' }}>
        {t('newCta')}
      </Link>
    </main>
  );
}
