import Link from 'next/link';
import { and, count, eq, lt } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { db } from '@/db';
import { verification, report, request, circle } from '@/db/schema';
import { requireRole } from '@/lib/admin';

/* N1 · Dashboard — counts that need ACTION, every tile linking to its
   queue. Not a vanity dashboard. */
export default async function AdminDashboardPage() {
  const locale = await getLocale();
  const actor = await requireRole(['coordinator', 'admin']);
  if (!actor) redirect(`/${locale}`);
  const t = await getTranslations('admin');

  const [pendingVerifs] = await db.select({ n: count() }).from(verification)
    .where(eq(verification.state, 'pending'));
  const [openIncidents] = await db.select({ n: count() }).from(report)
    .where(eq(report.status, 'open'));
  const [flagged] = await db.select({ n: count() }).from(request)
    .where(and(eq(request.status, 'looking'),
      lt(request.createdAt, new Date()),
    ));
  const flaggedRows = await db.select({ n: count() }).from(request)
    .where(eq(request.status, 'looking'));
  const [expiringSoon] = await db.select({ n: count() }).from(request)
    .where(and(eq(request.status, 'looking'),
      lt(request.expiresAt, new Date(Date.now() + 24 * 3600_000))));

  const tiles = [
    { n: pendingVerifs.n, label: t('dash.verifications'), href: 'verifications' },
    { n: openIncidents.n, label: t('dash.incidents'), href: 'incidents' },
    { n: expiringSoon.n, label: t('dash.expiringSoon'), href: 'requests/flagged' },
  ];

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: '24px', margin: '0 0 16px' }}>{t('dash.title')}</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        {tiles.map((x) => (
          <Link key={x.href} href={`/${locale}/admin/${x.href}`}
            style={{ textDecoration: 'none', color: 'inherit', border: '1px solid var(--n-200)', borderRadius: '12px', padding: '18px' }}>
            <span style={{ fontFamily: 'var(--serif)', fontSize: '34px', fontWeight: 700, color: x.n > 0 ? 'var(--t-900)' : 'var(--n-500)' }}>
              {x.n}
            </span>
            <p style={{ margin: '4px 0 0', fontWeight: 600, fontSize: '15px' }}>{x.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
