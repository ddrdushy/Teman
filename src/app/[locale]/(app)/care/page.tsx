import Link from 'next/link';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { db } from '@/db';
import { careRecipient } from '@/db/schema';
import { personIdFromSession } from '@/auth';
import { ListRow } from '@/components/ListRow';
import { EmptyState } from '@/components/EmptyState';

/* C6 · People I care for. The empty state explains why the feature exists —
   the thing that makes elderly adoption possible — not that it's empty. */
export default async function CarePage() {
  const locale = await getLocale();
  const personId = await personIdFromSession();
  if (!personId) redirect(`/${locale}`);
  const t = await getTranslations('care');

  const rows = await db.query.careRecipient.findMany({
    where: eq(careRecipient.managedBy, personId),
  });

  return (
    <main className="screen-pad" style={{ display: 'grid', gap: 'var(--s-4)' }}>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.5em', margin: 0 }}>{t('title')}</h1>
      <p style={{ color: 'var(--n-700)', margin: 0 }}>{t('lead')}</p>
      {rows.length === 0 ? (
        <EmptyState
          illustration="none"
          title={t('emptyTitle')}
          body={t('emptyBody')}
          action={
            <Link href={`/${locale}/care/new`} className="btn btn-primary btn-lg" style={{ textDecoration: 'none' }}>
              {t('addCta')}
            </Link>
          }
        />
      ) : (
        <>
          <div className="stack">
            {rows.map((r) => (
              <ListRow
                key={r.id}
                href={`/${locale}/care/${r.id}`}
                icon={r.preferredName.charAt(0)}
                title={r.preferredName}
                sub={[
                  r.relationship ? t(`relationship.${r.relationship}` as never) : null,
                  r.ageBand ? t(`ageBand.${r.ageBand}` as never) : null,
                ].filter(Boolean).join(' · ')}
              />
            ))}
          </div>
          <Link href={`/${locale}/care/new`} className="btn btn-primary btn-lg" style={{ textDecoration: 'none' }}>
            {t('addCta')}
          </Link>
        </>
      )}
      <p className="field-hint" style={{ margin: 0 }}>{t('neverNeedsPhone')}</p>
    </main>
  );
}
