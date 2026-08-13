import { desc, eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { db } from '@/db';
import { notification } from '@/db/schema';
import { personIdFromSession } from '@/auth';
import { Sisi, type SisiState } from '@/components/Sisi';
import { EmptyState } from '@/components/EmptyState';

/* B5 · Reverse-chronological, Sisi carries the state at 24px. Content is
   rendered in the viewer's language from kind + params — nothing was baked
   in at write time. */
export default async function NotificationsPage() {
  const locale = await getLocale();
  const personId = await personIdFromSession();
  if (!personId) redirect(`/${locale}`);
  const t = await getTranslations();

  const rows = await db.query.notification.findMany({
    where: eq(notification.personId, personId),
    orderBy: desc(notification.createdAt),
    limit: 50,
  });

  // Viewing marks read — a badge that never clears is a nag, not information.
  await db.update(notification)
    .set({ readAt: new Date() })
    .where(eq(notification.personId, personId));

  return (
    <main className="screen-pad" style={{ display: 'grid', gap: 'var(--s-4)' }}>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.5em', margin: 0 }}>
        {t('notifications.title')}
      </h1>
      {rows.length === 0 ? (
        <EmptyState title={t('notifications.emptyTitle')} body={t('notifications.emptyBody')} />
      ) : (
        <div className="stack">
          {rows.map((n) => (
            <div key={n.id} className="card" style={{ display: 'flex', gap: '0.7em', alignItems: 'flex-start' }}>
              {n.sisiState && <Sisi state={n.sisiState as SisiState} size={24} />}
              <div style={{ minWidth: 0 }}>
                <p style={{ margin: 0, fontWeight: 600, lineHeight: 1.35 }}>
                  {t(`notifications.${n.kind}`, (n.params as Record<string, string>) ?? {})}
                </p>
                <p className="card-meta" style={{ margin: '0.15em 0 0' }}>
                  {new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })
                    .format(n.createdAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
