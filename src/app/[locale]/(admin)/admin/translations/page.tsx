import { readFile } from 'node:fs/promises';
import { redirect } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { requireRole } from '@/lib/admin';

type Flat = Record<string, string>;
function flatten(obj: Record<string, unknown>, prefix = ''): Flat {
  const out: Flat = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object') Object.assign(out, flatten(v as Record<string, unknown>, key));
    else out[key] = String(v);
  }
  return out;
}

/* N19 · Translation management — every key, four columns, missing values
   highlighted. "Missing" = still identical to English, which is exactly what
   the human pass works through. Read-only here: catalogues are files shipped
   with the build; edits go through the repo. */
export default async function TranslationsPage() {
  const locale = await getLocale();
  const actor = await requireRole(['admin']);
  if (!actor) redirect(`/${locale}/admin`);
  const t = await getTranslations('admin');

  const load = async (l: string) =>
    flatten(JSON.parse(await readFile(`src/messages/${l}.json`, 'utf8')));
  const [en, ms, ta, zh] = await Promise.all(['en', 'ms', 'ta', 'zh'].map(load));

  const keys = Object.keys(en).sort();
  const missing = { ms: 0, ta: 0, zh: 0 };
  for (const k of keys) {
    if (ms[k] === en[k]) missing.ms++;
    if (ta[k] === en[k]) missing.ta++;
    if (zh[k] === en[k]) missing.zh++;
  }

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: '24px', margin: '0 0 4px' }}>{t('tr.title')}</h1>
      <p style={{ margin: '0 0 16px', color: 'var(--n-700)', fontSize: '14px' }}>
        {t('tr.summary', { total: keys.length, ms: missing.ms, ta: missing.ta, zh: missing.zh })}
      </p>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr>
              {['key', 'en', 'ms', 'ta', 'zh'].map((h) => (
                <th key={h} style={{ textAlign: 'start', padding: '6px 8px', borderBottom: '2px solid var(--n-200)', position: 'sticky', top: 0, background: 'var(--white)' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {keys.map((k) => (
              <tr key={k}>
                <td style={{ padding: '5px 8px', borderBottom: '1px solid var(--n-100)', fontFamily: 'ui-monospace, monospace', whiteSpace: 'nowrap' }}>{k}</td>
                <td style={{ padding: '5px 8px', borderBottom: '1px solid var(--n-100)' }}>{en[k]}</td>
                {([['ms', ms], ['ta', ta], ['zh', zh]] as const).map(([l, cat]) => (
                  <td key={l} lang={l} style={{
                    padding: '5px 8px', borderBottom: '1px solid var(--n-100)',
                    background: cat[k] === en[k] ? 'var(--warn-fill)' : undefined,
                  }}>
                    {cat[k] === en[k] ? '—' : cat[k]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
