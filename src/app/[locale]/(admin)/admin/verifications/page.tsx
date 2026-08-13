import Link from 'next/link';
import { asc, eq, sql as dsql } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { db } from '@/db';
import { verification, person, area } from '@/db/schema';
import { requireRole } from '@/lib/admin';

/* N6 · Review queue. Oldest first; waiting time coloured past 24h; rows whose
   doc_hash matches another account flagged at the top. */
export default async function VerificationQueuePage() {
  const locale = await getLocale();
  const actor = await requireRole(['coordinator', 'admin']);
  if (!actor) redirect(`/${locale}`);
  const t = await getTranslations('admin');

  const rows = await db
    .select({
      id: verification.id,
      createdAt: verification.createdAt,
      docType: verification.docType,
      name: person.displayName,
      areaName: area.name,
      dupCount: dsql<number>`(
        SELECT count(*)::int FROM verification v2
        WHERE v2.doc_hash = ${verification.docHash}
          AND v2.person_id <> ${verification.personId}
      )`,
    })
    .from(verification)
    .innerJoin(person, eq(verification.personId, person.id))
    .leftJoin(area, eq(person.areaId, area.id))
    .where(eq(verification.state, 'pending'))
    .orderBy(asc(verification.createdAt));

  const flagged = rows.filter((r) => r.dupCount > 0);
  const clean = rows.filter((r) => r.dupCount === 0);
  const ordered = [...flagged, ...clean];
  const hours = (d: Date) => Math.floor((Date.now() - d.getTime()) / 3_600_000);

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: '24px', margin: '0 0 4px' }}>{t('queue.title')}</h1>
      <p style={{ color: 'var(--n-700)', margin: '0 0 16px', fontSize: '15px' }}>
        {t('queue.count', { count: rows.length })}
      </p>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '15px' }}>
        <thead>
          <tr>
            {['name', 'area', 'doc', 'waiting', 'flags'].map((h) => (
              <th key={h} style={{ textAlign: 'start', padding: '8px 10px', borderBottom: '2px solid var(--n-200)', whiteSpace: 'nowrap' }}>
                {t(`queue.${h}`)}
              </th>
            ))}
            <th style={{ borderBottom: '2px solid var(--n-200)' }} />
          </tr>
        </thead>
        <tbody>
          {ordered.map((r) => {
            const h = hours(r.createdAt);
            return (
              <tr key={r.id}>
                <td style={{ padding: '10px' , borderBottom: '1px solid var(--n-100)' }}>{r.name}</td>
                <td style={{ padding: '10px', borderBottom: '1px solid var(--n-100)' }}>{r.areaName ?? '—'}</td>
                <td style={{ padding: '10px', borderBottom: '1px solid var(--n-100)' }}>{r.docType}</td>
                <td style={{
                  padding: '10px', borderBottom: '1px solid var(--n-100)', whiteSpace: 'nowrap',
                  color: h >= 24 ? 'var(--err-text)' : 'var(--n-900)', fontWeight: h >= 24 ? 700 : 400,
                }}>
                  {t('queue.hoursWaiting', { hours: h })}
                </td>
                <td style={{ padding: '10px', borderBottom: '1px solid var(--n-100)' }}>
                  {r.dupCount > 0 && (
                    <span className="pill pill-error">! {t('queue.duplicateFlag')}</span>
                  )}
                </td>
                <td style={{ padding: '10px', borderBottom: '1px solid var(--n-100)' }}>
                  <Link href={`/${locale}/admin/verifications/${r.id}`} style={{ color: 'var(--t-900)', fontWeight: 600 }}>
                    {t('queue.review')}
                  </Link>
                </td>
              </tr>
            );
          })}
          {ordered.length === 0 && (
            <tr><td colSpan={6} style={{ padding: '24px 10px', color: 'var(--n-700)' }}>{t('queue.empty')}</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
