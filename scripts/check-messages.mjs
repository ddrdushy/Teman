/**
 * Static audit: every t('…') literal in a component must resolve in en.json.
 * Heuristic — maps each file's useTranslations('ns')/getTranslations('ns')
 * to its t() calls; dynamic keys (template literals) are skipped. Exits
 * non-zero on missing keys. next-intl fails SOFT at runtime (logs, renders
 * the key path), which is exactly why this needs a hard check.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const flat = (o, p = '') => Object.entries(o).reduce((acc, [k, v]) => {
  const key = p ? `${p}.${k}` : k;
  if (v && typeof v === 'object') Object.assign(acc, flat(v, key));
  else acc[key] = true;
  return acc;
}, {});
const en = flat(JSON.parse(readFileSync('src/messages/en.json', 'utf8')));

const files = [];
(function walk(dir) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(tsx?|mjs)$/.test(f)) files.push(p);
  }
})('src');

let missing = 0;
for (const file of files) {
  const src = readFileSync(file, 'utf8');
  const nsMatches = [...src.matchAll(/(?:useTranslations|getTranslations)\(\s*'([^']+)'\s*\)/g)];
  const namespaces = nsMatches.map((m) => m[1]);
  // t('key') and t('key', {...}) with literal keys only
  for (const m of src.matchAll(/\bt\(\s*'([^']+)'/g)) {
    const key = m[1];
    if (key.includes('\u2026')) continue; // ellipsis in comments, not a key
    const hit = namespaces.some((ns) => en[`${ns}.${key}`]) ||
      en[key] ||
      (namespaces.length === 0 && Object.keys(en).some((k) => k.endsWith(`.${key}`)));
    if (!hit) {
      console.log(`MISSING: ${key}  (namespaces: ${namespaces.join(',') || '—'})  in ${file}`);
      missing++;
    }
  }
}
console.log(missing ? `\n${missing} missing key reference(s)` : 'all literal t() keys resolve');
process.exit(missing ? 1 : 0);
