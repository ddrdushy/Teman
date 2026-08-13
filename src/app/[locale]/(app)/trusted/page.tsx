import { eq, inArray } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { db } from '@/db';
import { trustedTeman, person, careRecipient } from '@/db/schema';
import { personIdFromSession } from '@/auth';
import { EmptyState } from '@/components/EmptyState';
import { ListRow } from '@/components/ListRow';

/* K1 · Trusted Temans, grouped: yours, then per care recipient. */
export default async function TrustedPage() {
  const locale = await getLocale();
  const personId = await personIdFromSession();
  if (!personId) redirect(`/${locale}`);
  const t = await getTranslations('community');

  const rows = await db.query.trustedTeman.findMany({ where: eq(trustedTeman.ownerId, personId) });
  const temans = rows.length
    ? await db.query.person.findMany({
        where: inArray(person.id, rows.map((r) => r.temanId)),
        columns: { id: true, displayName: true },
      })
    : [];
  const recipients = await db.query.careRecipient.findMany({
    where: eq(careRecipient.managedBy, personId),
    columns: { id: true, preferredName: true },
  });
  const nameOf = new Map(temans.map((p) => [p.id, p.displayName]));
  const groups: { label: string; temanIds: string[] }[] = [
    { label: t('trustedMine'), temanIds: rows.filter((r) => !r.forRecipientId).map((r) => r.temanId) },
    ...recipients.map((rec) => ({
      label: t('trustedFor', { name: rec.preferredName }),
      temanIds: rows.filter((r) => r.forRecipientId === rec.id).map((r) => r.temanId),
    })),
  ];

  return (
    <main className="screen-pad" style={{ display: 'grid', gap: 'var(--s-4)' }}>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.5em', margin: 0 }}>{t('trustedTitle')}</h1>
      <p style={{ color: 'var(--n-700)', margin: 0 }}>{t('trustedLead')}</p>
      {rows.length === 0 ? (
        <EmptyState illustration="none" title={t('trustedEmptyTitle')} body={t('trustedEmptyBody')} />
      ) : (
        groups.filter((g) => g.temanIds.length > 0).map((g) => (
          <section key={g.label} style={{ display: 'grid', gap: 'var(--s-2)' }}>
            <h2 className="label" style={{ color: 'var(--n-700)', margin: 0 }}>{g.label}</h2>
            <div className="stack">
              {g.temanIds.map((id) => (
                <ListRow key={id} href={`/${locale}/people/${id}`}
                  icon={(nameOf.get(id) ?? '·').charAt(0)} title={nameOf.get(id) ?? ''} />
              ))}
            </div>
          </section>
        ))
      )}
    </main>
  );
}
