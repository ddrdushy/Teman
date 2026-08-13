import { desc, eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { db } from '@/db';
import { auditLog, person } from '@/db/schema';
import { requireRole } from '@/lib/admin';

/* N22 · The audit log — read-only, append-only. Not even a platform admin
   can edit it; there is deliberately no write path here. */
export default async function AuditPage() {
  const locale = await getLocale();
  const actor = await requireRole(['admin']);
  if (!actor) redirect(`/${locale}/admin`);
  const t = await getTranslations('admin');

  const rows = await db.select({
    id: auditLog.id, action: auditLog.action, subjectType: auditLog.subjectType,
    at: auditLog.at, actorName: person.displayName,
  }).from(auditLog)
    .leftJoin(person, eq(auditLog.actorId, person.id))
    .orderBy(desc(auditLog.at))
    .limit(200);

  const fmt = new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'medium' });

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: '24px', margin: '0 0 4px' }}>{t('audit.title')}</h1>
      <p style={{ margin: '0 0 16px', color: 'var(--n-700)', fontSize: '14px' }}>{t('audit.appendOnly')}</p>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
        <thead>
          <tr>
            {['when', 'actor', 'action', 'subject'].map((h) => (
              <th key={h} style={{ textAlign: 'start', padding: '7px 10px', borderBottom: '2px solid var(--n-200)' }}>
                {t(`audit.${h}`)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td style={{ padding: '7px 10px', borderBottom: '1px solid var(--n-100)', whiteSpace: 'nowrap' }}>{fmt.format(r.at)}</td>
              <td style={{ padding: '7px 10px', borderBottom: '1px solid var(--n-100)' }}>{r.actorName ?? t('audit.system')}</td>
              <td style={{ padding: '7px 10px', borderBottom: '1px solid var(--n-100)', fontFamily: 'ui-monospace, monospace' }}>{r.action}</td>
              <td style={{ padding: '7px 10px', borderBottom: '1px solid var(--n-100)' }}>{r.subjectType ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
