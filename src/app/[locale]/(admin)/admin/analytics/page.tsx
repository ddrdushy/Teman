import { and, count, eq, gte, sql as dsql } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { db } from '@/db';
import { request, session, match, person } from '@/db/schema';
import { requireRole } from '@/lib/admin';

/* N20 · The numbers that matter. Teman Moments is the headline — a
   completed companionship, §44's primary metric. No engagement metrics
   exist anywhere to show. */
export default async function AnalyticsPage() {
  const locale = await getLocale();
  const actor = await requireRole(['coordinator', 'admin']);
  if (!actor) redirect(`/${locale}`);
  const t = await getTranslations('admin');

  const since = new Date(Date.now() - 90 * 24 * 3600_000);

  const [moments] = await db.select({ n: count() }).from(session)
    .where(and(eq(session.state, 'ended'), gte(session.endedAt, since)));
  const [created] = await db.select({ n: count() }).from(request)
    .where(gte(request.createdAt, since));
  const [matched] = await db.select({ n: count() }).from(match)
    .where(gte(match.createdAt, since));
  const [expired] = await db.select({ n: count() }).from(request)
    .where(and(eq(request.status, 'expired'), gte(request.createdAt, since)));
  const [activeTemans] = await db.select({ n: dsql<number>`count(DISTINCT ${match.temanId})::int` })
    .from(match).where(gte(match.createdAt, since));
  const [familyManaged] = await db.select({ n: count() }).from(request)
    .where(and(eq(request.beneficiaryType, 'care_recipient'), gte(request.createdAt, since)));
  const [medianRow] = await db.execute(dsql`
    SELECT percentile_cont(0.5) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (m.created_at - r.created_at)))/3600 AS median_h
    FROM match m JOIN request r ON r.id = m.request_id
    WHERE m.created_at >= ${since.toISOString()}::timestamptz
  `) as unknown as { median_h: number | null }[];

  const matchRate = created.n ? Math.round((matched.n / created.n) * 100) : 0;
  const unfulfilled = created.n ? Math.round((expired.n / created.n) * 100) : 0;
  const familyPct = created.n ? Math.round((familyManaged.n / created.n) * 100) : 0;

  const stats: [string, string][] = [
    [t('an.requestsCreated'), String(created.n)],
    [t('an.matched'), String(matched.n)],
    [t('an.matchRate'), `${matchRate}%`],
    [t('an.medianTime'), medianRow?.median_h != null ? t('an.hoursShort', { hours: Math.round(Number(medianRow.median_h)) }) : '—'],
    [t('an.activeTemans'), String(activeTemans.n)],
    [t('an.familyManaged'), `${familyPct}%`],
    [t('an.unfulfilled'), `${unfulfilled}%`],
  ];

  return (
    <div style={{ maxWidth: '680px' }}>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: '24px', margin: '0 0 16px' }}>{t('an.title')}</h1>
      {/* the headline */}
      <div style={{ border: '1px solid var(--n-200)', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
        <span style={{ fontFamily: 'var(--serif)', fontSize: '44px', fontWeight: 700, color: 'var(--t-900)' }}>
          {moments.n}
        </span>
        <p style={{ margin: '2px 0 0', fontWeight: 600 }}>{t('an.moments')}</p>
        <p style={{ margin: 0, fontSize: '13px', color: 'var(--n-700)' }}>{t('an.momentsSub')}</p>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '15px' }}>
        <tbody>
          {stats.map(([k, v], i) => (
            <tr key={i}>
              <td style={{ padding: '8px 0', borderBottom: '1px solid var(--n-100)', color: 'var(--n-700)' }}>{k}</td>
              <td style={{ padding: '8px 0', borderBottom: '1px solid var(--n-100)', fontWeight: 700, textAlign: 'end' }}>{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
