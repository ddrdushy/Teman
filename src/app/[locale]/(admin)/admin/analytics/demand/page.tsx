import { redirect } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { sql as dsql } from 'drizzle-orm';
import { db } from '@/db';
import { requireRole } from '@/lib/admin';

/* N21 ★ · Unmet demand by area — the screen that tells the NGO where to
   recruit next. Arguably the most operationally useful screen in admin. */
export default async function DemandPage() {
  const locale = await getLocale();
  const actor = await requireRole(['coordinator', 'admin']);
  if (!actor) redirect(`/${locale}`);
  const t = await getTranslations('admin');

  const rows = await db.execute(dsql`
    SELECT a.name,
           count(*) FILTER (WHERE r.status = 'expired')::int AS unmet,
           count(*)::int AS total
    FROM request r
    JOIN area a ON a.id = r.area_id
    GROUP BY a.name
    HAVING count(*) > 0
    ORDER BY (count(*) FILTER (WHERE r.status = 'expired'))::float / count(*) DESC
  `) as unknown as { name: string; unmet: number; total: number }[];

  return (
    <div style={{ maxWidth: '640px' }}>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: '24px', margin: '0 0 4px' }}>{t('demand.title')}</h1>
      <p style={{ margin: '0 0 16px', color: 'var(--n-700)', fontSize: '15px' }}>{t('demand.lead')}</p>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '15px' }}>
        <thead>
          <tr>
            {['area', 'unmetPct', 'unmetAbs'].map((h) => (
              <th key={h} style={{ textAlign: 'start', padding: '8px 10px', borderBottom: '2px solid var(--n-200)' }}>
                {t(`demand.${h}`)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const pct = Math.round((r.unmet / r.total) * 100);
            return (
              <tr key={r.name}>
                <td style={{ padding: '9px 10px', borderBottom: '1px solid var(--n-100)', fontWeight: 600 }}>{r.name}</td>
                <td style={{ padding: '9px 10px', borderBottom: '1px solid var(--n-100)' }}>
                  {/* number + bar — never colour alone */}
                  <b style={{ color: pct >= 40 ? 'var(--err-text)' : 'var(--n-900)' }}>{pct}%</b>
                  <span aria-hidden="true" style={{
                    display: 'inline-block', marginInlineStart: 8, height: 8, width: `${pct}px`,
                    maxWidth: '120px', background: 'var(--t-800)', borderRadius: 4, verticalAlign: 'middle',
                  }} />
                </td>
                <td style={{ padding: '9px 10px', borderBottom: '1px solid var(--n-100)' }}>
                  {t('demand.ofTotal', { unmet: r.unmet, total: r.total })}
                </td>
              </tr>
            );
          })}
          {rows.length === 0 && (
            <tr><td colSpan={3} style={{ padding: '20px 10px', color: 'var(--n-700)' }}>{t('demand.empty')}</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
