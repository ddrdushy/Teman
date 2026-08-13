const { chromium } = require('playwright');

const BASE = 'http://localhost:3100';
const OUT = '/Users/symprio/Desktop/teman/public/shots';
const RID = '6e1ffb10-3d92-422d-a3fc-afe198d5586c';
const OID = '94a3f84f-a06d-4f64-9db0-2f7647db096b';
const LOCALES = ['en', 'ms', 'ta', 'zh'];

async function login(page, digits) {
  await page.goto(`${BASE}/en/join/phone`, { waitUntil: 'networkidle' });
  await page.fill('input', digits);
  await page.click('button.btn-primary');
  await page.waitForURL('**/otp**', { timeout: 20000 });
  await page.fill('input', '000000');
  await page.click('button.btn-primary');
  await page.waitForURL(/\/(home|nearby|join\/next|welcome)/, { timeout: 30000 });
}

async function snap(page, url, file) {
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: file });
  console.log('✓', file.replace(/^.*shots\//, ''));
}

(async () => {
  const browser = await chromium.launch({ headless: true });

  // context A: Dushy (elder) — home, ask, offer
  const ctxA = await browser.newContext({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2 });
  const a = await ctxA.newPage();
  await login(a, '12 000 0001');
  for (const l of LOCALES) {
    await snap(a, `${BASE}/${l}/home`, `${OUT}/${l}/home.png`);
    await snap(a, `${BASE}/${l}/requests/new`, `${OUT}/${l}/ask.png`);
    await snap(a, `${BASE}/${l}/requests/${RID}/offers/${OID}`, `${OUT}/${l}/offer.png`);
  }
  await ctxA.close();

  // context B: Kumar (volunteer) — nearby
  const ctxB = await browser.newContext({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2 });
  const b = await ctxB.newPage();
  await login(b, '12 000 0002');
  for (const l of LOCALES) {
    await snap(b, `${BASE}/${l}/nearby`, `${OUT}/${l}/nearby.png`);
  }
  await ctxB.close();

  await browser.close();
  console.log('done');
})();
