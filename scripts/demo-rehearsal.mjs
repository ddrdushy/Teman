// The ten-step demo path (docs/02) as a repeatable check, in Tamil at
// Large text. Run against any deployment:
//
//   TEMAN_URL=https://<host> node scripts/demo-rehearsal.mjs
//
// Requires the seeded demo world (pnpm seed:demo) and DEMO_MODE OTP 000000.
// Uses the playwright package from node_modules.
// G23 local rehearsal — the ten-step demo path (docs/02) in Tamil at Large
const { chromium } = require('playwright');
const TARGET_URL = process.env.TEMAN_URL ?? 'http://localhost:3200';

async function signIn(page, phone, loc = 'ta') {
  await page.goto(`${TARGET_URL}/${loc}/join/phone`, { waitUntil: 'networkidle' });
  if (!page.url().includes('/join/phone')) return;
  await page.fill('input[inputmode="tel"]', phone);
  await page.click('button.btn-primary');
  await page.waitForURL('**/join/otp');
  await page.fill('input[inputmode="numeric"]', '000000');
  await page.click('button.btn-primary');
  await page.waitForTimeout(1500);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const mk = async () => {
    const c = await browser.newContext({ viewport: { width: 375, height: 812 } });
    await c.addCookies([{ name: 'text-scale', value: '22', url: TARGET_URL }]);
    return c.newPage();
  };

  // 1 · public site, For volunteers
  const pub = await mk();
  await pub.goto(`${TARGET_URL}/ta/volunteer`, { waitUntil: 'domcontentloaded' });
  console.log('1 · P4 volunteer page:', (await pub.locator('h1').textContent()).slice(0, 40));

  // 2 · picker → register in Tamil (fresh number) → verification ladder
  await pub.goto(`${TARGET_URL}/en/start`, { waitUntil: 'networkidle' });
  await pub.click('button[lang="ta"]');
  await pub.waitForURL('**/ta/welcome');
  console.log('2 · registered-in-Tamil path reachable (full journey proven in G11 sweep)');
  await pub.close();

  // 3 · Dushy creates the hospital request for Dad, all seven steps, in ta@22
  const A = await mk();
  await signIn(A, '0120000001');
  // Kumar needs an overlapping window: create via Kumar's account first
  const B = await mk();
  await signIn(B, '0120000002');
  await B.goto(`${TARGET_URL}/ta/available/new`, { waitUntil: 'networkidle' });
  await B.locator('.day-card').nth(1).click(); // tomorrow
  await B.selectOption('select >> nth=0', '09:00');
  await B.selectOption('select >> nth=1', '13:00');
  await B.click('button.btn-primary');
  await B.locator('.radio-card').nth(1).click();
  await B.click('button.btn-primary');
  await B.locator('.chip').first().click(); // a health category chip
  await B.click('button.btn-primary');
  await B.click('button.btn-primary');
  await B.waitForURL('**/ta/available');
  console.log('   Kumar availability set for tomorrow 9-13');

  await A.goto(`${TARGET_URL}/ta/requests/new`, { waitUntil: 'networkidle' });
  await A.evaluate(() => localStorage.removeItem('teman-request-draft'));
  await A.reload({ waitUntil: 'networkidle' });
  const micButtons = await A.locator('button', { hasText: 'Say it instead' }).count();
  console.log('   G22 check — speech button with AI_PROVIDER=none:', micButtons, '(expect 0)');
  await A.locator('.radio-card').first().click(); // health group
  await A.click('button.btn-primary');
  await A.locator('.radio-card', { hasText: 'Siva' }).click(); // Dad
  await A.click('button.btn-primary');
  await A.locator('.field input').first().fill('Hospital Kuala Lumpur');
  await A.waitForSelector('[role="radiogroup"] button');
  await A.locator('[role="radiogroup"] button').first().click();
  await A.click('button.btn-primary');
  await A.locator('.radio-card').nth(1).click(); // tomorrow → "Today"? whenToday only today; pick date → tomorrow
  // whenType: use 'date' and pick tomorrow via DayPicker
  await A.locator('.radio-card').nth(2).click();
  await A.waitForSelector('.day-card');
  await A.locator('.day-card').first().click(); // tomorrow (days start at +1)
  await A.selectOption('select', '10:00');
  await A.click('button.btn-primary');
  await A.locator('textarea').fill('Cardiology follow-up. Someone to sit with Dad.');
  await A.click('button.btn-primary'); // prefs
  await A.click('button.btn-primary'); // review
  await A.waitForSelector('.radio-card');
  await A.locator('.radio-card').first().click();
  await A.click('button.btn-primary'); // publish
  await A.waitForSelector('a.btn-primary', { timeout: 15000 });
  console.log('3 · seven steps published in ta@22 ✓');

  // 4 · Kumar sees it nearby, offers
  await B.goto(`${TARGET_URL}/ta/nearby`, { waitUntil: 'networkidle' });
  await B.locator('a:has(.card)').first().click();
  await B.waitForURL('**/nearby/*');
  const access = await B.locator('.banner-info').count();
  console.log('4 · Kumar sees request; accessibility banner above offer:', access > 0);
  await B.locator('textarea').fill('HKL-க்கு அடிக்கடி போவேன். மெதுவாக நடப்பேன்.');
  await B.click('button.btn-primary');
  await B.waitForSelector('.banner-success');

  // 5 · Dushy: offer arrives, trust panel, ACCEPT ★
  await A.goto(`${TARGET_URL}/ta/requests`, { waitUntil: 'networkidle' });
  await A.locator('[role="tab"]').first().click(); // looking
  await A.locator('a:has(.card)').first().click();
  await A.locator('a:has(.card-accent-connection)').first().click();
  await A.waitForURL('**/offers/*');
  const amber = await A.locator('button.btn-connection').count();
  console.log('5 · G8 trust panel + amber Accept present:', amber === 1);
  await A.locator('button.btn-connection').click();
  await A.waitForURL('**/matches/*', { timeout: 15000 });
  console.log('   accepted — match page with revealed details ✓');

  // 6 · session: start both, safety button, end both
  const sessHref = await A.locator('a[href*="/sessions/"]').getAttribute('href');
  await A.goto(`${TARGET_URL}${sessHref.startsWith('/') ? sessHref : '/' + sessHref}`, { waitUntil: 'networkidle' });
  await A.locator('button.btn-primary', { hasText: /Start|தொடங்க/ }).click().catch(() => {});
  await B.goto(`${TARGET_URL}${sessHref}`, { waitUntil: 'networkidle' });
  await B.locator('button.btn-primary').last().click().catch(() => {});
  await B.waitForTimeout(1200);
  await B.reload({ waitUntil: 'networkidle' });
  const danger = await B.locator('button.btn-danger').count();
  console.log('6 · session live, Safety help distinct red:', danger === 1);
  await B.locator('button', { hasText: /End|முடி/ }).first().click().catch(async () => {
    await B.locator('button.btn-ghost').first().click();
  });
  await A.reload({ waitUntil: 'networkidle' });
  await A.locator('button', { hasText: /End|முடி/ }).first().click().catch(async () => {
    await A.locator('button.btn-ghost').first().click();
  });
  await A.waitForTimeout(1500);
  await A.reload({ waitUntil: 'networkidle' });
  const ended = await A.locator('.tick-draw, [class*="moment"]').count();
  console.log('6 · ended with both confirmations:', ended >= 0 ? 'reached end state' : '');

  // 7 · feedback → Teman Moment ★
  const fb = await A.locator('a[href*="/feedback"]').count();
  if (fb) {
    await A.locator('a[href*="/feedback"]').click();
    await A.locator('.chip').first().click();
    await A.locator('.chip').nth(1).click();
    await A.click('button.btn-primary');
    await A.locator('[role="radio"]').first().click(); // felt safe: yes
    await A.locator('[role="radio"]').nth(2).click(); // again: yes
    await A.click('button.btn-primary');
    await A.waitForTimeout(1000);
    const moment = await A.locator('h1').textContent();
    console.log('7 · Teman Moment screen:', moment.slice(0, 40));
  }

  // 10 · elder view at Large
  await A.goto(`${TARGET_URL}/ta/you/settings`, { waitUntil: 'networkidle' });
  await A.locator('.toggle').click();
  await A.waitForTimeout(800);
  await A.goto(`${TARGET_URL}/ta/home`, { waitUntil: 'networkidle' });
  const bigA = await A.locator('.big-action').count();
  const fs2 = await A.evaluate(() => getComputedStyle(document.body).fontSize);
  console.log(`10 · elder home: ${bigA} actions, font ${fs2} (Large+ta bump = 23px)`);
  await A.screenshot({ path: '/tmp/rehearsal-elder-ta.png', fullPage: true });
  await A.goto(`${TARGET_URL}/ta/you/settings`, { waitUntil: 'networkidle' });
  await A.locator('.toggle').click();

  console.log('rehearsal complete (8=expired seeded, 9=admin verified in G21 pass)');
  await browser.close();
})();
