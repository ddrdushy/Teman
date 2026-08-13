/**
 * The demo world (docs/10): Brickfields, six months after a soft launch with
 * Pertubuhan Warga Emas KL. Written as content, not fixtures — every name
 * here will be read aloud in a meeting.
 *
 *   node scripts/seed/demo.mjs           build the world (idempotent-ish)
 *   node scripts/seed/demo.mjs --reset   drop member data and rebuild
 *
 * Deterministic (seeded RNG). All dates relative to now. Refuses to run
 * against production or a database containing non-demo phone numbers.
 */
import postgres from 'postgres';

if (process.env.NODE_ENV === 'production') {
  console.error('seed: refusing to run in production'); process.exit(1);
}
const sql = postgres(process.env.DATABASE_URL ?? 'postgres://teman:dev@localhost:5433/teman');

/* deterministic RNG — the same command produces the same world */
let rngState = 42;
const rng = () => { rngState = (rngState * 1664525 + 1013904223) % 4294967296; return rngState / 4294967296; };
const pick = (arr) => arr[Math.floor(rng() * arr.length)];
const days = (n) => new Date(Date.now() + n * 86400_000);
const at = (d, h, m = 0) => { const x = new Date(d); x.setHours(h, m, 0, 0); return x; };

/* guard: only demo-range and seeded phones may exist */
const foreign = await sql`
  SELECT count(*)::int AS n FROM person
  WHERE phone_e164 NOT LIKE '+6012000%' AND phone_e164 NOT LIKE '+60177%'
    AND phone_e164 NOT LIKE '+6017888%' AND phone_e164 NOT LIKE '+6017123%'`;
if (foreign[0].n > 0 && !process.argv.includes('--reset') && !process.argv.includes('--force')) {
  console.error(`seed: ${foreign[0].n} non-demo account(s) present — run with --reset to wipe member data`);
  process.exit(1);
}

if (process.argv.includes('--reset')) {
  await sql`TRUNCATE person CASCADE`;
  await sql`TRUNCATE organisation CASCADE`;
  console.log('reset: member data cleared');
}

const areaId = async (name) =>
  (await sql`SELECT id FROM area WHERE name = ${name} LIMIT 1`)[0]?.id;
const catId = async (key) =>
  (await sql`SELECT id FROM category WHERE key = ${key} LIMIT 1`)[0]?.id;
const AREAS = Object.fromEntries(await Promise.all(
  ['Brickfields', 'Bangsar', 'Sentul', 'Cheras', 'Kepong', 'Petaling Jaya'].map(async (n) => [n, await areaId(n)]),
));

async function centroidWkt(area) {
  const r = await sql`SELECT ST_AsText(centroid::geometry) AS wkt FROM area WHERE id = ${area}`;
  return r[0]?.wkt ?? 'POINT(101.6841 3.129)';
}
async function jitter(area) {
  const wkt = await centroidWkt(area);
  const [lng, lat] = wkt.replace('POINT(', '').replace(')', '').split(' ').map(Number);
  return `POINT(${lng + (rng() - 0.5) * 0.008} ${lat + (rng() - 0.5) * 0.008})`;
}

/* ── people ─────────────────────────────────────────────────────── */
let phoneCounter = 100;
const nextPhone = () => `+601770${String(phoneCounter++).padStart(4, '0')}`;

async function upsertPerson(p) {
  const [row] = await sql`
    INSERT INTO person (phone_e164, phone_verified_at, display_name, preferred_language,
                        text_scale, area_id, approx_point, bio, languages, verification_tier,
                        role, is_elder_view, created_at)
    VALUES (${p.phone}, now(), ${p.name}, ${p.lang ?? 'en'},
            ${p.scale ?? 18}, ${p.area}, ${await jitter(p.area)}, ${p.bio ?? null},
            ${p.languages ?? []}, ${p.tier ?? 'basic'}, ${p.role ?? null},
            ${p.elder ?? false}, ${p.createdAt ?? days(-Math.floor(30 + rng() * 150))})
    ON CONFLICT (phone_e164) DO UPDATE SET display_name = EXCLUDED.display_name,
      preferred_language = EXCLUDED.preferred_language, area_id = EXCLUDED.area_id,
      verification_tier = EXCLUDED.verification_tier, role = EXCLUDED.role
    RETURNING id`;
  return row.id;
}

/* the four demo logins (docs/10) — OTP 000000 via DEMO_MODE */
const dushy = await upsertPerson({
  phone: '+60120000001', name: 'Dushy Ramanathan', lang: 'en', area: AREAS.Brickfields,
  tier: 'identity', languages: ['en', 'ta', 'ms'],
  bio: 'Work near KL Sentral. I arrange company for my parents, and help where I can on weekends.',
  createdAt: days(-170),
});
const kumar = await upsertPerson({
  phone: '+60120000002', name: 'Kumar Rajendran', lang: 'ta', area: AREAS.Brickfields,
  tier: 'identity', languages: ['ta', 'en', 'ms'],
  bio: 'Retired technician in Brickfields. I go to HKL often and can drive. Happy to accompany uncles and aunties, or just have coffee.',
  createdAt: days(-160),
});
const siti = await upsertPerson({
  phone: '+60120000003', name: 'Siti Nurhaliza binti Osman', lang: 'ms', area: AREAS.Brickfields,
  tier: 'identity', role: 'coordinator', languages: ['ms', 'en'], createdAt: days(-180),
});
await upsertPerson({
  phone: '+60120000004', name: 'Teman Admin', lang: 'en', area: AREAS.Brickfields,
  tier: 'identity', role: 'admin', languages: ['en'], createdAt: days(-180),
});

/* twenty named volunteers (docs/10 table) + generated rest */
const NAMED = [
  ['Farah binti Ahmad', 29, 'Brickfields', ['ms', 'en'], 'pendingVerif', 'ms'],
  ['Mei Ling Tan', 41, 'Brickfields', ['zh-mandarin', 'en'], 'identity', 'zh'],
  ['Ravi Chandran', 63, 'Brickfields', ['ta', 'en'], 'identity', 'ta'],
  ['Nurul Izzah binti Hamid', 24, 'Sentul', ['ms'], 'basic', 'ms'],
  ['Wong Kah Meng', 37, 'Bangsar', ['zh-cantonese', 'en', 'ms'], 'identity', 'en'],
  ['Siti Aminah binti Yusof', 45, 'Brickfields', ['ms', 'en'], 'basic', 'ms'],
  ['Ganesh Muthu', 48, 'Sentul', ['ta', 'ms'], 'pendingVerif', 'ta'],
  ['Aisha Rahman', 31, 'Brickfields', ['ms', 'en'], 'pendingVerif', 'en'],
  ['Lee Chong Wei', 55, 'Bangsar', ['zh-mandarin', 'en'], 'pendingVerif', 'zh'],
  ['Sundram Pillai', 58, 'Brickfields', ['ta', 'en'], 'pendingVerif', 'ta'],
  ['Chong Mei Fang', 33, 'Cheras', ['zh-mandarin', 'zh-cantonese'], 'pendingVerif', 'zh'],
  ['Aziz Hassan', 44, 'Sentul', ['ms'], 'identity', 'ms'],
  ['Priya Sivakumar', 27, 'Brickfields', ['ta', 'en'], 'identity', 'ta'],
  ['Jaya Letchumi', 67, 'Brickfields', ['ta', 'ms'], 'identity', 'ta'],
  ['Hafiz bin Rosli', 22, 'Brickfields', ['ms', 'en'], 'basic', 'ms'],
  ['Tan Wei Jun', 35, 'Bangsar', ['zh-mandarin', 'en'], 'identity', 'zh'],
  ['Kamala Devi', 59, 'Cheras', ['ta', 'en'], 'identity', 'ta'],
  ['Rosnah binti Ismail', 51, 'Brickfields', ['ms'], 'identity', 'ms'],
  ['Vijay Kumaran', 40, 'Brickfields', ['ta', 'en', 'ms'], 'identity', 'ta'],
  ['Meor Danial bin Shah', 34, 'Kepong', ['ms', 'en'], 'basic', 'ms'],
];
const volunteers = { 'Kumar Rajendran': kumar };
for (const [name, , area, languages, tier, lang] of NAMED) {
  volunteers[name] = await upsertPerson({
    phone: nextPhone(), name, area: AREAS[area], languages, lang,
    tier: tier === 'pendingVerif' ? 'basic' : tier,
  });
}
/* twenty generated, demographically mixed */
const GEN = [
  'Ahmad Faiz bin Omar', 'Lim Wei Sheng', 'Saraswathy Naidu', 'Noraini binti Zain',
  'Chan Kok Leong', 'Muthu Selvam', 'Faridah binti Karim', 'Ooi Beng Huat',
  'Anitha Krishnan', 'Zulkifli bin Ahmad', 'Tan Siew Peng', 'Rajeswari Muniandy',
  'Halim bin Ismail', 'Yap Mei Yee', 'Suresh Nair', 'Aminah binti Daud',
  'Goh Chin Aun', 'Letchumy Arumugam', 'Shahrul bin Nizam', 'Wong Li Hua',
];
for (const name of GEN) {
  const area = pick(['Brickfields', 'Brickfields', 'Brickfields', 'Bangsar', 'Sentul', 'Cheras']);
  volunteers[name] = await upsertPerson({
    phone: nextPhone(), name, area: AREAS[area],
    languages: pick([['ms', 'en'], ['ta', 'en'], ['zh-mandarin'], ['en', 'ms'], ['ta', 'ms']]),
    tier: pick(['identity', 'identity', 'identity', 'basic']),
    lang: pick(['en', 'ms', 'ta', 'zh']),
  });
}
console.log(`people: ${Object.keys(volunteers).length + 4}`);

/* ── care recipients ────────────────────────────────────────────── */
async function recipient(managedBy, name, lang, extra = {}) {
  const [r] = await sql`
    INSERT INTO care_recipient (managed_by, preferred_name, relationship, age_band,
      preferred_language, mobility_notes, accessibility, conversation_prefs, emergency_contact)
    VALUES (${managedBy}, ${name}, ${extra.rel ?? 'parent'}, ${extra.age ?? '70s'}, ${lang},
      ${extra.notes ?? null}, ${extra.access ?? []}, ${extra.conv ?? []},
      ${extra.ec ?? null})
    RETURNING id`;
  return r.id;
}
const siva = await recipient(dushy, 'Siva Ramanathan', 'ta', {
  notes: 'Walks slowly and likes to rest along the way. Enjoys talking about trains.',
  access: ['slowWalking', 'restsOften'],
  ec: { name: 'Meena', phone: '+60129998877', relationship: 'sister' },
});
const kamalaR = await recipient(dushy, 'Kamala Ramanathan', 'ta', { age: '60s' });
const fatimah = await recipient(volunteers['Nurul Izzah binti Hamid'], 'Fatimah binti Salleh', 'ms', {
  age: '70s', access: ['wheelchair'], notes: 'Uses a wheelchair. Cheerful, likes the market.',
});
const limAhKow = await recipient(volunteers['Mei Ling Tan'], 'Lim Ah Kow', 'zh', {
  age: '80s', access: ['hearing'], notes: 'Hokkien only. Hearing difficulty — speak up, face him.',
});
const rajamma = await recipient(volunteers['Priya Sivakumar'], 'Rajamma', 'ta', {
  age: '70s', rel: 'relative', notes: 'Lives alone in PJ. A weekly visit and tea means a lot.',
});
await recipient(volunteers['Hafiz bin Rosli'], 'Mohd Yusof bin Awang', 'ms', {
  age: '70s', notes: 'Recovering from surgery — temporary help only.',
});
await recipient(volunteers['Wong Kah Meng'], 'Ng Siew Lan', 'zh', {
  age: '70s', conv: ['casualChat'], notes: 'Wants help using her phone, and patience.',
});
const devi = await recipient(volunteers['Vijay Kumaran'], 'Devi Ammal', 'ta', {
  age: '80s', access: ['slowWalking'], notes: 'Frequent appointments. Loves a morning walk.',
});
console.log('care recipients: 8');

/* ── verifications: history + the admin queue ───────────────────── */
const hoursAgo = (h) => new Date(Date.now() - h * 3600_000);
async function verif(personId, state, opts = {}) {
  await sql`
    INSERT INTO verification (person_id, tier, doc_type, doc_hash, state,
      reviewed_by, reviewed_at, reject_reason, purge_after, created_at)
    VALUES (${personId}, 'identity', ${opts.docType ?? 'mykad'}, ${opts.hash ?? `h_${personId.slice(0, 8)}`},
      ${state}, ${state === 'pending' ? null : siti},
      ${state === 'pending' ? null : opts.reviewedAt ?? days(-20)},
      ${opts.reason ?? null},
      ${state === 'pending' ? null : days(70)}, ${opts.createdAt ?? days(-21)})`;
}
for (const [name] of NAMED) {
  const tier = NAMED.find(([n]) => n === name)[4];
  if (tier === 'identity') await verif(volunteers[name], 'approved');
}
await verif(kumar, 'approved');
await verif(volunteers['Farah binti Ahmad'], 'pending', { createdAt: hoursAgo(19) });
await verif(volunteers['Ganesh Muthu'], 'pending', { hash: 'h_duplicate_demo', createdAt: hoursAgo(11) });
await verif(volunteers['Ahmad Faiz bin Omar'], 'approved', { hash: 'h_duplicate_demo' }); // the same MyKad, elsewhere
await verif(volunteers['Lee Chong Wei'], 'pending', { createdAt: hoursAgo(7) });
await verif(volunteers['Aisha Rahman'], 'pending', { docType: 'passport', createdAt: hoursAgo(4) });
await verif(volunteers['Sundram Pillai'], 'pending', { createdAt: hoursAgo(2) });
await verif(volunteers['Chong Mei Fang'], 'pending', { createdAt: hoursAgo(1) });
await verif(volunteers['Siti Aminah binti Yusof'], 'rejected', {
  reason: 'cutOff: the bottom corner is cut off — all four corners need to be visible',
  reviewedAt: days(-3), createdAt: days(-4),
});
console.log('verifications: queue of 6 pending (1 duplicate), 1 rejected, history approved');

/* ── requests, matches, sessions, feedback ──────────────────────── */
const CATS = {};
for (const k of ['hospital', 'clinic', 'groceries', 'walk', 'talk', 'coffeeChat', 'welfareVisit', 'phoneBasics', 'bank', 'sit']) {
  CATS[k] = await catId(k);
}
async function makeRequest(o) {
  const [r] = await sql`
    INSERT INTO request (requester_id, beneficiary_type, beneficiary_id, category_id,
      status, urgency, title, description, area_id, approx_point, exact_point, exact_address,
      starts_at, ends_at, prefs, visibility, flagged_reason, expires_at, created_at)
    VALUES (${o.by}, ${o.forRec ? 'care_recipient' : 'self'}, ${o.forRec ?? null},
      ${o.cat}, ${o.status}, ${o.urgency ?? 'planned'}, ${o.title}, ${o.desc ?? null},
      ${o.area}, ${await jitter(o.area)}, ${await centroidWkt(o.area)}, ${o.address ?? null},
      ${o.startsAt}, ${o.endsAt ?? new Date(o.startsAt.getTime() + 2 * 3600_000)},
      ${o.prefs ?? {}}, 'public', ${o.flag ?? null},
      ${o.expiresAt ?? new Date(o.startsAt.getTime() - 12 * 3600_000)}, ${o.createdAt ?? days(-3)})
    RETURNING id`;
  return r.id;
}
async function makeMatch(requestId, temanId, when) {
  const [m] = await sql`
    INSERT INTO match (request_id, teman_id, accepted_by_requester_at, accepted_by_teman_at, created_at)
    VALUES (${requestId}, ${temanId}, ${when}, ${when}, ${when}) RETURNING id`;
  return m.id;
}
async function makeSession(matchId, state, startedAt, endedAt) {
  const [s] = await sql`
    INSERT INTO session (match_id, state, started_at, ended_at)
    VALUES (${matchId}, ${state}, ${startedAt ?? null}, ${endedAt ?? null}) RETURNING id`;
  return s.id;
}

/* 1 ★ the spine: Friday 9:30 HKL for Dad, matched with Kumar */
const friday = (() => { const d = new Date(); do { d.setDate(d.getDate() + 1); } while (d.getDay() !== 5); return d; })();
const spine = await makeRequest({
  by: dushy, forRec: siva, cat: CATS.hospital, status: 'matched',
  title: 'Hospital Kuala Lumpur', area: AREAS.Brickfields,
  desc: 'Dad has a follow-up at the cardiology clinic. He just needs someone to sit with him and help find the right counter.',
  address: 'HKL main entrance, Jalan Pahang', startsAt: at(friday, 9, 30),
  prefs: { languages: ['ta', 'en'], verifiedOnly: true },
});
const spineMatch = await makeMatch(spine, kumar, days(-1));
await makeSession(spineMatch, 'scheduled');

/* messages on the spine — real coordination, not filler */
for (const [from, body, minsAgo] of [
  [kumar, 'Hello. I will wait at the main entrance from 9:20.', 220],
  [dushy, 'Thank you Kumar. Dad wears a blue cap, he is quite short.', 200],
  [kumar, 'Noted. Does he need a wheelchair inside?', 190],
  [dushy, 'No, but slowly is better. He will tell you when he needs to sit.', 180],
]) {
  await sql`INSERT INTO message (request_id, sender_id, body, created_at)
    VALUES (${spine}, ${from}, ${body}, ${new Date(Date.now() - minsAgo * 60_000)})`;
}

/* 2-4 looking (incl. Fatimah's wheelchair groceries, the no-advice talk) */
const saturday = (() => { const d = new Date(); do { d.setDate(d.getDate() + 1); } while (d.getDay() !== 6); return d; })();
await makeRequest({
  by: volunteers['Nurul Izzah binti Hamid'], forRec: fatimah, cat: CATS.groceries, status: 'looking',
  title: 'Brickfields market', area: AREAS.Brickfields, startsAt: at(saturday, 10),
  desc: 'Mak Cik Fatimah would love her Saturday market trip. She uses a wheelchair — the market is step-free.',
  expiresAt: at(saturday, 10 - 14),
});
await makeRequest({
  by: volunteers['Tan Wei Jun'], cat: CATS.talk, status: 'looking',
  title: 'Tea near KL Sentral', area: AREAS.Brickfields, startsAt: at(days(0), 19), urgency: 'today',
  desc: 'A difficult week. I do not need advice — just someone to have tea with.',
  prefs: { gender: 'women', mood: ['noAdvice'], languages: ['en', 'ms'] },
  expiresAt: at(days(0), 18),
});
await makeRequest({
  by: volunteers['Wong Kah Meng'], forRec: null, cat: CATS.bank, status: 'looking',
  title: 'Maybank Brickfields', area: AREAS.Brickfields, startsAt: at(days(2), 10),
});
await makeRequest({
  by: volunteers['Hafiz bin Rosli'], cat: CATS.walk, status: 'looking',
  title: 'KLCC park walk', area: AREAS.Bangsar, startsAt: at(days(3), 7, 30),
});

/* 5-6 matched (beyond the spine) */
for (const [by, rec, cat, title, area, teman, dayOffset] of [
  [volunteers['Priya Sivakumar'], rajamma, CATS.welfareVisit, 'Welfare visit, PJ', 'Petaling Jaya', volunteers['Kamala Devi'], 2],
  [volunteers['Mei Ling Tan'], null, CATS.clinic, 'Klinik Kesihatan Bangsar', 'Bangsar', volunteers['Wong Kah Meng'], 4],
]) {
  const r = await makeRequest({ by, forRec: rec, cat, title, area: AREAS[area], status: 'matched', startsAt: at(days(dayOffset), 10) });
  const m = await makeMatch(r, teman, days(-1));
  await makeSession(m, 'scheduled');
}

/* 7 active right now */
const activeReq = await makeRequest({
  by: volunteers['Rosnah binti Ismail'], cat: CATS.sit, status: 'active',
  title: 'Company at home, Brickfields', area: AREAS.Brickfields,
  startsAt: new Date(Date.now() - 40 * 60_000),
});
const activeMatch = await makeMatch(activeReq, volunteers['Jaya Letchumi'], days(-1));
await makeSession(activeMatch, 'active', new Date(Date.now() - 35 * 60_000));

/* 8 cancelled, honestly */
await makeRequest({
  by: dushy, forRec: kamalaR, cat: CATS.clinic, status: 'cancelled',
  title: 'Dental check-up', area: AREAS.Brickfields, startsAt: days(-6),
  createdAt: days(-9),
});

/* 9-10 expired unmatched — the screens every product hides */
await makeRequest({
  by: volunteers['Mei Ling Tan'], forRec: limAhKow, cat: CATS.clinic, status: 'expired',
  title: 'Klinik Kesihatan, Thursday', area: AREAS.Cheras, startsAt: days(-2),
  desc: 'Uncle Lim speaks Hokkien only. He needs someone who can really talk with him.',
  prefs: { languages: ['hokkien'] }, createdAt: days(-6),
});
await makeRequest({
  by: volunteers['Chong Mei Fang'], cat: CATS.hospital, status: 'expired',
  title: 'Hospital Cheras', area: AREAS.Cheras, startsAt: days(-8), createdAt: days(-12),
});

/* 11-25 completed history + the analytics curve: ~147 ended sessions over
   90 days, weekly counts rising ~4 → ~21 with two dips (docs/10). */
const WEEKLY = [4, 5, 6, 8, 9, 7 /* Raya dip */, 11, 13, 12 /* the unexplained dip */, 15, 17, 19, 21];
const volNames = Object.keys(volunteers);
const DESCRIPTOR_POOL = ['patient', 'kind', 'reliable', 'goodListener', 'helpful', 'respectful'];
let ended = 0;
for (let w = 0; w < WEEKLY.length; w++) {
  for (let i = 0; i < WEEKLY[w]; i++) {
    const dayOff = -(90 - w * 7 - Math.floor(rng() * 6));
    const requesterName = pick(volNames);
    let temanName = pick(volNames);
    while (temanName === requesterName) temanName = pick(volNames);
    const started = at(days(dayOff), 9 + Math.floor(rng() * 8));
    const r = await makeRequest({
      by: volunteers[requesterName], cat: pick([CATS.hospital, CATS.groceries, CATS.walk, CATS.coffeeChat, CATS.clinic]),
      title: pick(['Hospital Kuala Lumpur', 'Brickfields market', 'Morning walk', 'Coffee at the kopitiam', 'Klinik follow-up']),
      area: AREAS[pick(['Brickfields', 'Brickfields', 'Bangsar', 'Sentul', 'Cheras'])],
      status: 'completed', startsAt: started, createdAt: days(dayOff - 3),
    });
    const m = await makeMatch(r, volunteers[temanName], days(dayOff - 1));
    const s = await makeSession(m, 'ended', started, new Date(started.getTime() + (1 + rng() * 2) * 3600_000));
    ended++;
    /* ~80% leave feedback — a 100% rate reads as fake */
    if (rng() < 0.8) {
      const n = 1 + Math.floor(rng() * 3);
      const descriptors = [...new Set(Array.from({ length: n }, () => pick(DESCRIPTOR_POOL)))];
      await sql`INSERT INTO feedback (session_id, from_person, about_person, role, descriptors, felt_safe, would_meet_again)
        VALUES (${s}, ${volunteers[requesterName]}, ${volunteers[temanName]}, 'requester', ${descriptors}, true, ${rng() < 0.9})`;
    }
  }
}
/* the deliberate texture (docs/10): Sentul and Cheras are under-served —
   expired requests concentrated there make the unmet-demand screen tell a
   real story: recruit in Sentul next, and find Tamil speakers. */
for (const [areaName, n] of [['Sentul', 26], ['Cheras', 24], ['Kepong', 4]]) {
  for (let i = 0; i < n; i++) {
    await makeRequest({
      by: volunteers[pick(volNames)],
      cat: pick([CATS.hospital, CATS.clinic, CATS.groceries]),
      title: pick(['Hospital Cheras', 'Klinik follow-up', 'Groceries', 'Government office']),
      area: AREAS[areaName], status: 'expired',
      startsAt: days(-Math.floor(5 + rng() * 80)),
      prefs: rng() < 0.3 ? { languages: [pick(['ta', 'hokkien', 'zh-cantonese'])] } : {},
      createdAt: days(-Math.floor(10 + rng() * 80)),
    });
  }
}
console.log(`requests + history: 25 textured + curve (${ended} ended sessions) + under-served texture`);

/* ── incident #I-0093 and companions ────────────────────────────── */
/* urgent: Aziz asked Wei Jun for money mid-session, prior report, restricted */
const aziz = volunteers['Aziz Hassan'];
const weiJun = volunteers['Tan Wei Jun'];
const azReq = await makeRequest({
  by: weiJun, cat: CATS.groceries, status: 'completed',
  title: 'Groceries, Bangsar', area: AREAS.Bangsar, startsAt: at(days(-1), 15), createdAt: days(-3),
});
const azMatch = await makeMatch(azReq, aziz, days(-2));
const azSession = await makeSession(azMatch, 'ended', at(days(-1), 15), at(days(-1), 16, 20));
await sql`INSERT INTO message (request_id, sender_id, body, created_at) VALUES
  (${azReq}, ${aziz}, 'Boss, can help me first? I short RM50 for my bike petrol, I pay you back next week', ${at(days(-1), 15, 41)}),
  (${azReq}, ${weiJun}, 'Sorry, no. Teman says no money.', ${at(days(-1), 15, 44)})`;
await sql`INSERT INTO report (reporter_id, subject_person_id, session_id, category, detail, severity, status, created_at)
  VALUES (${weiJun}, ${aziz}, ${azSession}, 'moneyRequest',
    'He asked me for RM50 during the session, message attached. Second time I heard of this.',
    'urgent', 'open', ${at(days(-1), 16, 31)})`;
await sql`INSERT INTO report (reporter_id, subject_person_id, category, detail, severity, status, handled_by, handled_at, created_at)
  VALUES (${volunteers['Rosnah binti Ismail']}, ${aziz}, 'moneyRequest', 'Hinted about needing money after a session in June.', 'high', 'warned', ${siti}, ${days(-55)}, ${days(-58)})`;
await sql`UPDATE person SET suspended_at = ${at(days(-1), 16, 31)} WHERE id = ${aziz}`;

/* high: the anonymous felt-unsafe auto-case */
const fuReq = await makeRequest({
  by: volunteers['Saraswathy Naidu'], cat: CATS.coffeeChat, status: 'completed',
  title: 'Coffee, Sentul', area: AREAS.Sentul, startsAt: days(-2), createdAt: days(-4),
});
const fuMatch = await makeMatch(fuReq, volunteers['Chan Kok Leong'], days(-3));
const fuSession = await makeSession(fuMatch, 'ended', days(-2), days(-2));
await sql`INSERT INTO feedback (session_id, from_person, about_person, role, descriptors, felt_safe, would_meet_again)
  VALUES (${fuSession}, ${volunteers['Saraswathy Naidu']}, ${volunteers['Chan Kok Leong']}, 'requester', ${[]}, false, false)`;
await sql`INSERT INTO report (reporter_id, subject_person_id, session_id, category, severity, status, created_at)
  VALUES (${volunteers['Saraswathy Naidu']}, ${volunteers['Chan Kok Leong']}, ${fuSession}, 'feltUnsafe', 'high', 'open', ${days(-2)})`;

/* low: a session nobody ended */
const abReq = await makeRequest({
  by: volunteers['Faridah binti Karim'], cat: CATS.walk, status: 'completed',
  title: 'Evening walk', area: AREAS.Kepong, startsAt: days(-3), createdAt: days(-5),
});
const abMatch = await makeMatch(abReq, volunteers['Zulkifli bin Ahmad'], days(-4));
await makeSession(abMatch, 'abandoned', days(-3), null);
await sql`INSERT INTO report (reporter_id, subject_person_id, category, detail, severity, status, created_at)
  VALUES (${volunteers['Faridah binti Karim']}, ${volunteers['Zulkifli bin Ahmad']}, 'other',
    'System: session was never ended by either side; both unreachable for three hours.', 'low', 'open', ${days(-3)})`;

/* flagged requests — the two from docs/10 */
await makeRequest({
  by: volunteers['Goh Chin Aun'], cat: CATS.talk, status: 'looking',
  title: 'Urgent cash help needed', area: AREAS.Cheras, startsAt: days(1), flag: 'money',
});
await makeRequest({
  by: volunteers['Shahrul bin Nizam'], cat: CATS.coffeeChat, status: 'looking',
  title: 'Looking for a nice lady to have dinner', area: AREAS.Kepong, startsAt: days(1), flag: 'dating',
});
console.log('incidents: I-0093 urgent + auto high + system low; 2 flagged requests');

/* ── relationships, community, availability ─────────────────────── */
for (const temanId of [kumar, volunteers['Farah binti Ahmad'], volunteers['Mei Ling Tan']]) {
  await sql`INSERT INTO trusted_teman (owner_id, teman_id, for_recipient_id)
    VALUES (${dushy}, ${temanId}, ${siva}) ON CONFLICT DO NOTHING`;
}
await sql`INSERT INTO trusted_teman (owner_id, teman_id) VALUES (${dushy}, ${volunteers['Priya Sivakumar']}) ON CONFLICT DO NOTHING`;
await sql`INSERT INTO trusted_contact (person_id, name, phone, relationship, notify_on)
  VALUES (${dushy}, 'Meena', '+60129998877', 'sister', ${{ start: true, end: true }})`;

for (const [reqer, teman, rec, cat, title, freq, state] of [
  [volunteers['Vijay Kumaran'], volunteers['Jaya Letchumi'], devi, CATS.walk, 'Morning walk with Devi Ammal', 'fortnightly', 'active'],
  [dushy, kumar, siva, CATS.clinic, 'Monthly clinic with Dad', 'monthly', 'active'],
  [volunteers['Wong Kah Meng'], volunteers['Yap Mei Yee'], null, CATS.phoneBasics, 'Weekly phone help for Ng Siew Lan', 'weekly', 'active'],
  [volunteers['Mei Ling Tan'], volunteers['Ravi Chandran'], limAhKow, CATS.sit, 'Sitting with Uncle Lim', 'weekly', 'paused'],
]) {
  await sql`INSERT INTO recurring (requester_id, teman_id, for_recipient_id, category_id, title,
    frequency, time_of_day, state, proposed_by, next_date)
    VALUES (${reqer}, ${teman}, ${rec}, ${cat}, ${title}, ${freq}, '08:00', ${state}, ${reqer}, ${days(5)})`;
}

const [org] = await sql`INSERT INTO organisation (name, type, area_id, verified_at, contact)
  VALUES ('Pertubuhan Warga Emas KL', 'senior_care', ${AREAS.Brickfields}, ${days(-150)},
    ${{ email: 'warga.emas.kl@example.my' }}) RETURNING id`;
const [c1] = await sql`INSERT INTO circle (name, area_id, organisation_id, join_policy, status, created_by)
  VALUES ('Brickfields Teman Community', ${AREAS.Brickfields}, ${org.id}, 'open', 'active', ${siti}) RETURNING id`;
const [c2] = await sql`INSERT INTO circle (name, area_id, join_policy, status, created_by)
  VALUES ('Sri Lankan Community KL', ${AREAS.Brickfields}, 'open', 'active', ${volunteers['Sundram Pillai']}) RETURNING id`;
await sql`INSERT INTO circle (name, area_id, join_policy, status, created_by)
  VALUES ('Vista Condo Residents', ${AREAS.Bangsar}, 'approval', 'pending', ${volunteers['Wong Kah Meng']})`;
const allIds = [dushy, kumar, ...Object.values(volunteers)];
for (const pid of allIds.slice(0, 38)) {
  await sql`INSERT INTO circle_member (circle_id, person_id, role) VALUES (${c1.id}, ${pid},
    ${pid === siti ? 'coordinator' : 'member'}) ON CONFLICT DO NOTHING`;
}
for (const pid of allIds.filter(() => rng() < 0.5).slice(0, 20)) {
  await sql`INSERT INTO circle_member (circle_id, person_id) VALUES (${c2.id}, ${pid}) ON CONFLICT DO NOTHING`;
}

/* availability: 22 volunteers with upcoming slots, 9 deliberately without */
const withSlots = Object.values(volunteers).slice(0, 22);
for (const pid of withSlots) {
  const start = at(days(1 + Math.floor(rng() * 4)), 9 + Math.floor(rng() * 6));
  const centre = await jitter(AREAS.Brickfields);
  await sql`INSERT INTO availability (person_id, starts_at, ends_at, area_id, centre_point, radius_m, categories, repeats_weekly)
    VALUES (${pid}, ${start}, ${new Date(start.getTime() + 4 * 3600_000)}, ${AREAS.Brickfields},
      ${centre}, ${pick([1000, 5000, 5000, 25000])}, ${[CATS.hospital, CATS.groceries]}, ${rng() < 0.4})`;
}

/* notifications so B5 is never empty on demo accounts */
for (const [pid, kind, params, sisi] of [
  [dushy, 'matchConfirmed', { name: 'Kumar' }, 'answered'],
  [dushy, 'reminder24h', { title: 'Hospital Kuala Lumpur' }, 'answered'],
  [kumar, 'offerAccepted', { title: 'Hospital Kuala Lumpur' }, 'answered'],
  [kumar, 'recurringAgreed', { title: 'Monthly clinic with Dad' }, 'answered'],
]) {
  await sql`INSERT INTO notification (person_id, kind, params, sisi_state) VALUES (${pid}, ${kind}, ${params}, ${sisi})`;
}

/* audit texture: ~60 entries over 90 days */
for (let i = 0; i < 60; i++) {
  const action = pick(['verification_approved', 'reveal_location', 'admin_viewed_user',
    'admin_viewed_verification', 'request_published', 'match_created', 'session_started', 'session_ended']);
  await sql`INSERT INTO audit_log (actor_id, action, subject_type, at)
    VALUES (${pick([siti, dushy, kumar])}, ${action}, ${action.includes('verification') ? 'verification' : 'request'},
      ${days(-Math.floor(rng() * 90))})`;
}
await sql`INSERT INTO audit_log (actor_id, action, subject_type, subject_id, meta, at)
  VALUES (${siti}, 'user_restricted', 'person', ${aziz}, ${{ reason: 'money request during session, second occurrence' }}, ${at(days(-1), 16, 35)})`;

const counts = await sql`SELECT
  (SELECT count(*) FROM person)::int AS people,
  (SELECT count(*) FROM request)::int AS requests,
  (SELECT count(*) FROM session WHERE state='ended')::int AS moments,
  (SELECT count(*) FROM verification WHERE state='pending')::int AS queue,
  (SELECT count(*) FROM report WHERE status='open')::int AS incidents`;
console.log('seeded:', counts[0]);
await sql.end();
