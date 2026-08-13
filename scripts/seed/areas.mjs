/**
 * Area hierarchy seed — the first slice of the demo world (docs/10 grows
 * module by module; this lands with G6 because A6 needs areas to exist).
 * Idempotent: skips rows whose name already exists at the same level.
 *
 *   node scripts/seed/areas.mjs        (reads DATABASE_URL)
 */
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL ?? 'postgres://teman:dev@localhost:5433/teman');

const KL_AREAS = [
  // name, ms, ta, zh, lat, lng
  ['Brickfields', 'Brickfields', 'பிரிக்ஃபீல்ட்ஸ்', '十五碑', 3.129, 101.6841],
  ['Bangsar', 'Bangsar', 'பங்சார்', '孟沙', 3.1279, 101.669],
  ['Sentul', 'Sentul', 'செந்தூல்', '冼都', 3.1857, 101.6957],
  ['Cheras', 'Cheras', 'சேராஸ்', '蕉赖', 3.0723, 101.7405],
  ['Kepong', 'Kepong', 'கெப்போங்', '甲洞', 3.2144, 101.637],
  ['Petaling Jaya', 'Petaling Jaya', 'பெட்டாலிங் ஜெயா', '八打灵再也', 3.1073, 101.6067],
  ['KL Sentral', 'KL Sentral', 'கே.எல். சென்ட்ரல்', '吉隆坡中环', 3.1337, 101.6869],
  ['Pudu', 'Pudu', 'புடு', '半山芭', 3.1349, 101.7133],
  ['Setapak', 'Setapak', 'செத்தாபாக்', '文良港', 3.2021, 101.7207],
  ['Old Klang Road', 'Jalan Klang Lama', 'பழைய கிளாங் சாலை', '旧巴生路', 3.0934, 101.6769],
];

async function upsert(level, name, names, parentId, lat, lng) {
  const existing = await sql`
    SELECT id FROM area WHERE level = ${level} AND name = ${name} LIMIT 1`;
  if (existing.length) return existing[0].id;
  const [row] = await sql`
    INSERT INTO area (level, name, name_ms, name_ta, name_zh, parent_id, centroid)
    VALUES (${level}, ${name}, ${names?.ms ?? null}, ${names?.ta ?? null}, ${names?.zh ?? null},
            ${parentId}, ${lat != null ? `POINT(${lng} ${lat})` : null})
    RETURNING id`;
  return row.id;
}

const my = await upsert('country', 'Malaysia', { ms: 'Malaysia', ta: 'மலேசியா', zh: '马来西亚' }, null, null, null);
const kl = await upsert('state', 'Kuala Lumpur', { ms: 'Kuala Lumpur', ta: 'கோலாலம்பூர்', zh: '吉隆坡' }, my, 3.139, 101.6869);
for (const [name, ms, ta, zh, lat, lng] of KL_AREAS) {
  await upsert('area', name, { ms, ta, zh }, kl, lat, lng);
}

const [{ count }] = await sql`SELECT count(*)::int AS count FROM area`;
console.log(`areas seeded: ${count} rows total`);
await sql.end();
