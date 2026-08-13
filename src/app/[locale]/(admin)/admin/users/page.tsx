import Link from 'next/link';
import { desc, eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { db } from '@/db';
import { person, area } from '@/db/schema';
import { requireRole } from '@/lib/admin';

/* N2 · User list. Admin only (the coordinator gets the volunteer
   directory instead). */
export default async function AdminUsersPage() {
  const locale = await getLocale();
  const actor = await requireRole(['admin']);
  if (!actor) redirect(`/${locale}/admin`);
  const t = await getTranslations('admin');

  const rows = await db.select({
    id: person.id, name: person.displayName, tier: person.verificationTier,
    lang: person.preferredLanguage, suspendedAt: person.suspendedAt,
    role: person.role, areaName: area.name, createdAt: person.createdAt,
  }).from(person)
    .leftJoin(area, eq(person.areaId, area.id))
    .orderBy(desc(person.createdAt))
    .limit(200);

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: '24px', margin: '0 0 16px' }}>{t('users.title')}</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '15px' }}>
        <thead>
          <tr>
            {['name', 'area', 'tier', 'lang', 'status'].map((h) => (
              <th key={h} style={{ textAlign: 'start', padding: '8px 10px', borderBottom: '2px solid var(--n-200)' }}>
                {t(`users.${h}`)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td style={{ padding: '9px 10px', borderBottom: '1px solid var(--n-100)' }}>
                <Link href={`/${locale}/admin/users/${r.id}`} style={{ color: 'var(--t-900)', fontWeight: 600 }}>
                  {r.name || '—'}
                </Link>
                {r.role && <span style={{ marginInlineStart: 6 }} className="pill pill-neutral">{r.role}</span>}
              </td>
              <td style={{ padding: '9px 10px', borderBottom: '1px solid var(--n-100)' }}>{r.areaName ?? '—'}</td>
              <td style={{ padding: '9px 10px', borderBottom: '1px solid var(--n-100)' }}>{r.tier}</td>
              <td style={{ padding: '9px 10px', borderBottom: '1px solid var(--n-100)' }}>{r.lang}</td>
              <td style={{ padding: '9px 10px', borderBottom: '1px solid var(--n-100)' }}>
                {r.suspendedAt
                  ? <span className="pill pill-error">{t('users.restricted')}</span>
                  : <span className="pill pill-completed">{t('users.active')}</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
