import Link from 'next/link';
import { asc, eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { db } from '@/db';
import { report, person } from '@/db/schema';
import { requireRole } from '@/lib/admin';

/* N10 · Incident queue — urgent pinned, time since report shown.
   felt_safe=false cases arrive here automatically. */
export default async function IncidentQueuePage() {
  const locale = await getLocale();
  const actor = await requireRole(['admin']);
  if (!actor) redirect(`/${locale}/admin`);
  const t = await getTranslations('admin');

  const rows = await db.select({
    id: report.id, category: report.category, severity: report.severity,
    status: report.status, createdAt: report.createdAt,
    subjectName: person.displayName,
  }).from(report)
    .innerJoin(person, eq(report.subjectPersonId, person.id))
    .where(eq(report.status, 'open'))
    .orderBy(asc(report.createdAt));

  const order = { urgent: 0, high: 1, low: 2 } as Record<string, number>;
  rows.sort((a, b) => (order[a.severity] ?? 3) - (order[b.severity] ?? 3));
  const hours = (d: Date) => Math.floor((Date.now() - d.getTime()) / 3_600_000);

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: '24px', margin: '0 0 16px' }}>{t('inc.title')}</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '15px' }}>
        <thead>
          <tr>
            {['severity', 'category', 'subject', 'age'].map((h) => (
              <th key={h} style={{ textAlign: 'start', padding: '8px 10px', borderBottom: '2px solid var(--n-200)' }}>
                {t(`inc.${h}`)}
              </th>
            ))}
            <th style={{ borderBottom: '2px solid var(--n-200)' }} />
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td style={{ padding: '10px', borderBottom: '1px solid var(--n-100)' }}>
                <span className={`pill ${r.severity === 'urgent' ? 'pill-error' : r.severity === 'high' ? 'pill-looking' : 'pill-neutral'}`}>
                  {t(`inc.sev.${r.severity}` as never)}
                </span>
              </td>
              <td style={{ padding: '10px', borderBottom: '1px solid var(--n-100)' }}>{t(`inc.cat.${r.category}` as never)}</td>
              <td style={{ padding: '10px', borderBottom: '1px solid var(--n-100)' }}>{r.subjectName}</td>
              <td style={{ padding: '10px', borderBottom: '1px solid var(--n-100)', whiteSpace: 'nowrap' }}>
                {t('inc.hoursAgo', { hours: hours(r.createdAt) })}
              </td>
              <td style={{ padding: '10px', borderBottom: '1px solid var(--n-100)' }}>
                <Link href={`/${locale}/admin/incidents/${r.id}`} style={{ color: 'var(--t-900)', fontWeight: 600 }}>
                  {t('inc.open')}
                </Link>
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={5} style={{ padding: '24px 10px', color: 'var(--n-700)' }}>{t('inc.empty')}</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
