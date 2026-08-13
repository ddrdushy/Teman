import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { sql as dsql } from 'drizzle-orm';
import { db } from '@/db';
import { requireRole } from '@/lib/admin';

/* N8 · Same doc_hash across accounts. Usually innocent (a re-registration),
   occasionally not — the pattern is what the reviewer needs to see. */
export default async function DuplicatesPage() {
  const locale = await getLocale();
  const actor = await requireRole(['coordinator', 'admin']);
  if (!actor) redirect(`/${locale}`);
  const t = await getTranslations('admin');

  const groups = await db.execute(dsql`
    SELECT v.doc_hash,
           json_agg(json_build_object(
             'verificationId', v.id, 'name', p.display_name,
             'state', v.state, 'created', to_char(v.created_at, 'YYYY-MM-DD')
           ) ORDER BY v.created_at) AS entries
    FROM verification v
    JOIN person p ON p.id = v.person_id
    WHERE v.doc_hash IN (
      SELECT doc_hash FROM verification
      WHERE doc_hash IS NOT NULL
      GROUP BY doc_hash
      HAVING count(DISTINCT person_id) > 1
    )
    GROUP BY v.doc_hash
  `);

  type Entry = { verificationId: string; name: string; state: string; created: string };
  const rows = groups as unknown as { doc_hash: string; entries: Entry[] }[];

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: '24px', margin: '0 0 16px' }}>{t('dup.title')}</h1>
      {rows.length === 0 && <p style={{ color: 'var(--n-700)' }}>{t('dup.empty')}</p>}
      {rows.map((g) => (
        <div key={g.doc_hash} className="card" style={{ marginBottom: '12px' }}>
          <p className="card-meta" style={{ margin: '0 0 6px' }}>{t('dup.groupLabel')}</p>
          {g.entries.map((e) => (
            <p key={e.verificationId} style={{ margin: '4px 0', fontSize: '15px' }}>
              <Link href={`/${locale}/admin/verifications/${e.verificationId}`} style={{ color: 'var(--t-900)', fontWeight: 600 }}>
                {e.name}
              </Link>{' '}
              · {e.state} · {e.created}
            </p>
          ))}
        </div>
      ))}
    </div>
  );
}
