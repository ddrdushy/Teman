/**
 * Category taxonomy from docs/05 (D-03 … D-10). A table, not an enum — the
 * NGO adds and renames these in admin (N18) without a migration. Idempotent
 * by key. ms/ta/zh names start null and fall back to English until the
 * human translation pass fills them in.
 */
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL ?? 'postgres://teman:dev@localhost:5433/teman');

const CATS = [
  // group, key, en
  ['health', 'hospital', 'Hospital visit'],
  ['health', 'clinic', 'Clinic appointment'],
  ['health', 'dental', 'Dental appointment'],
  ['health', 'physio', 'Physiotherapy'],
  ['health', 'followup', 'Medical follow-up'],
  ['health', 'screening', 'Health screening'],
  ['health', 'pharmacy', 'Pharmacy visit'],
  ['health', 'medication', 'Collecting medication'],
  ['errands', 'groceries', 'Grocery shopping'],
  ['errands', 'bank', 'Bank visit'],
  ['errands', 'government', 'Government office'],
  ['errands', 'post', 'Post office'],
  ['errands', 'bills', 'Paying bills'],
  ['errands', 'forms', 'Filling simple forms'],
  ['errands', 'unfamiliar', 'Going somewhere unfamiliar'],
  ['elderly', 'accompanyOutside', 'Accompany me outside'],
  ['elderly', 'walk', 'Walk with me'],
  ['elderly', 'sit', 'Sit with me for a while'],
  ['elderly', 'phoneHelp', 'Help me use my phone'],
  ['elderly', 'checkIn', 'Check in on me'],
  ['emotional', 'talk', 'Someone to talk to'],
  ['emotional', 'listen', 'Someone to listen'],
  ['emotional', 'coffeeChat', 'Coffee and conversation'],
  ['emotional', 'quietCompany', 'Quiet company'],
  ['social', 'parkWalk', 'Walk in the park'],
  ['social', 'mealTogether', 'Coffee or a meal together'],
  ['social', 'event', 'Visit a community event'],
  ['social', 'market', 'Go to a market'],
  ['social', 'library', 'Visit a library'],
  ['welfare', 'welfareVisit', 'Visit and check on someone'],
  ['digital', 'phoneBasics', 'Help using a smartphone'],
  ['digital', 'onlineServices', 'Online government services'],
  ['digital', 'videoCall', 'Set up a video call'],
];

let sort = 0;
for (const [group, key, en] of CATS) {
  sort += 10;
  await sql`
    INSERT INTO category ("group", key, name_en, sort)
    VALUES (${group}, ${key}, ${en}, ${sort})
    ON CONFLICT (key) DO UPDATE SET "group" = ${group}, name_en = ${en}, sort = ${sort}`;
}
const [{ count }] = await sql`SELECT count(*)::int AS count FROM category`;
console.log(`categories seeded: ${count}`);
await sql.end();
