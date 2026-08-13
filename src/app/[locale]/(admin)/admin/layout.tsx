import type { ReactNode } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { requireRole } from '@/lib/admin';

/* The admin shell. Desktop-first, deliberately plain — dense tables, no
   design pass (docs/08). The elderly rules don't apply here; the audit rules
   absolutely do. */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale();
  const actor = await requireRole(['coordinator', 'admin']);
  if (!actor) redirect(`/${locale}`);
  const t = await getTranslations('admin');

  return (
    <div style={{ display: 'flex', minHeight: '100dvh', background: 'var(--white)' }}>
      <nav style={{
        flex: '0 0 220px', borderInlineEnd: '1px solid var(--n-200)',
        padding: 'var(--s-5) var(--s-4)', display: 'flex', flexDirection: 'column', gap: 'var(--s-2)',
        fontSize: '15px',
      }}>
        <p style={{ fontFamily: 'var(--serif)', fontWeight: 700, fontSize: '18px', margin: '0 0 var(--s-3)' }}>
          {t('title')}
        </p>
        {[
          ['', 'dashboard'],
          ['/verifications', 'verifications'],
          ['/verifications/duplicates', 'duplicates'],
          ['/volunteers', 'volunteers'],
          ...(actor.role === 'admin'
            ? [
                ['/users', 'users'],
                ['/incidents', 'incidents'],
                ['/requests/flagged', 'flagged'],
                ['/circles', 'circles'],
                ['/analytics', 'analytics'],
                ['/analytics/demand', 'demand'],
                ['/translations', 'translations'],
                ['/audit', 'audit'],
              ]
            : [['/circles', 'circles'], ['/analytics', 'analytics'], ['/analytics/demand', 'demand']]),
        ].map(([path, key]) => (
          <Link key={key} href={`/${locale}/admin${path}`}
            style={{ color: 'var(--t-900)', textDecoration: 'none', padding: '6px 0' }}>
            {t(`nav.${key}` as never)}
          </Link>
        ))}
        <p style={{ marginTop: 'auto', color: 'var(--n-700)', fontSize: '13px' }}>
          {t('signedInAs', { name: actor.displayName, role: t(`role.${actor.role}`) })}
        </p>
      </nav>
      <div style={{ flex: 1, padding: 'var(--s-6)', minWidth: 0, overflowX: 'auto' }}>{children}</div>
    </div>
  );
}
