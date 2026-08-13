/**
 * Computes WCAG 2.x contrast ratios from the actual values in
 * src/app/tokens.css and checks them against the approved-combinations table
 * in TEMAN_BRAND_KIT.md §4. Exits non-zero on any regression, so a token edit
 * that quietly breaks the elderly contrast floor fails loudly.
 *
 * Thresholds: body text 7:1 (AAA), secondary/labels per the kit's own table,
 * non-text boundaries 3:1.
 */
import { readFileSync } from 'node:fs';

const css = readFileSync('src/app/tokens.css', 'utf8');
const vars = {};
for (const m of css.matchAll(/--([\w-]+):\s*(#[0-9A-Fa-f]{6})/g)) vars[m[1]] = m[2];

const lum = (hex) => {
  const c = [1, 3, 5].map((i) => {
    const v = parseInt(hex.slice(i, i + 2), 16) / 255;
    return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a, b) => {
  const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
};

const WHITE = '#FFFFFF';
// [label, fg, bg, minimum, use]
const PAIRS = [
  ['Neutral 900 / Neutral 50',  vars['n-900'], vars['n-050'], 7.0,  'body text'],
  ['Neutral 700 / Neutral 50',  vars['n-700'], vars['n-050'], 7.0,  'secondary text'],
  ['White / Teal 900',          WHITE,         vars['t-900'], 7.0,  'primary button label'],
  ['Neutral 900 / Amber 400',   vars['n-900'], vars['a-400'], 7.0,  'Accept button label'],
  ['Teal 900 / Neutral 50',     vars['t-900'], vars['n-050'], 7.0,  'links, active nav (v1.1)'],
  ['Teal 900 / Neutral 100',    vars['t-900'], vars['n-100'], 7.0,  'labels on tinted surfaces'],
  ['Amber 300 / Teal 900',      vars['a-300'], vars['t-900'], 4.5,  'amber text on deep panels (AA)'],
  ['Amber 700 / Neutral 50',    vars['a-700'], vars['n-050'], 4.5,  'amber text on light (AA)'],
  ['Error text / Error fill',   vars['err-text'], vars['err-fill'], 7.0, 'safety banners'],
  ['Success text / fill',       vars['ok-text'],  vars['ok-fill'],  7.0, 'success banners'],
  ['Warn text / fill',          vars['warn-text'], vars['warn-fill'], 7.0, 'waiting banners'],
  ['Info text / fill',          vars['info-text'], vars['info-fill'], 7.0, 'info banners'],
  ['Neutral 500 / Neutral 50',  vars['n-500'], vars['n-050'], 3.0,  'interactive borders (non-text)'],
  ['Teal 800 / Neutral 50',     vars['t-800'], vars['n-050'], 3.0,  'large text and icons only'],
  ['Amber 400 / Teal 900',      vars['a-400'], vars['t-900'], 3.0,  'Sisi fill — shapes only'],
  ['White / Teal 800',          WHITE,         vars['t-800'], 4.5,  'large text on Teal 800 (AA)'],
];

let failed = 0;
console.log('pair'.padEnd(28) + 'computed  needs   use');
for (const [label, fg, bg, min, use] of PAIRS) {
  if (!fg || !bg) { console.log(`${label.padEnd(28)}MISSING TOKEN`); failed++; continue; }
  const r = ratio(fg, bg);
  const ok = r >= min;
  if (!ok) failed++;
  console.log(
    `${label.padEnd(28)}${r.toFixed(2).padStart(6)}   ≥${min.toFixed(1)}   ${use}${ok ? '' : '   ✗ FAIL'}`,
  );
}

if (failed) {
  console.error(`\n${failed} pair(s) below their floor.`);
  process.exit(1);
}
console.log('\nall pairs clear their floors');
