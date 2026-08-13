# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: basic.spec.ts >> Teman Application >> should persist user preferences
- Location: tests/e2e/basic.spec.ts:47:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.goto: Test timeout of 30000ms exceeded.
Call log:
  - navigating to "http://localhost:3001/", waiting until "load"

```

# Page snapshot

```yaml
- generic [ref=f1e2]:
  - banner [ref=f1e3]:
    - generic [ref=f1e4]:
      - link "Teman home" [ref=f1e5] [cursor=pointer]:
        - /url: /en
        - img "Teman" [ref=f1e6]
      - navigation [ref=f1e10]:
        - link "How it works" [ref=f1e11] [cursor=pointer]:
          - /url: /en/how-it-works
        - link "For volunteers" [ref=f1e12] [cursor=pointer]:
          - /url: /en/volunteer
        - link "For families" [ref=f1e13] [cursor=pointer]:
          - /url: /en/families
        - link "Safety" [ref=f1e14] [cursor=pointer]:
          - /url: /en/safety
        - button "🌐 Choose your language" [ref=f1e15] [cursor=pointer]
  - main [ref=f1e17]:
    - generic [ref=f1e18]:
      - heading "I need someone. I can be there." [level=1] [ref=f1e19]:
        - generic [ref=f1e20]: I need someone.
        - generic [ref=f1e21]: I can be there.
      - figure "Someone is missing." [ref=f1e22]:
        - img "Someone is missing." [ref=f1e23]
      - paragraph [ref=f1e27]: Teman connects people in Kuala Lumpur who need someone beside them with neighbours who have a few hours to give.
      - paragraph [ref=f1e28]:
        - generic [ref=f1e29]: Always free. No payments, ever.
      - generic [ref=f1e30]:
        - link "Find a Teman" [ref=f1e31] [cursor=pointer]:
          - /url: /en/start
        - link "Become a Teman" [ref=f1e32] [cursor=pointer]:
          - /url: /en/volunteer
    - generic [ref=f1e34]:
      - heading "Loneliness in a city is rarely a logistics problem." [level=2] [ref=f1e35]
      - paragraph [ref=f1e36]: Most people can get themselves to the hospital. What they cannot do is walk in with nobody waiting for them to come out. Meanwhile the same neighbourhood is full of people with two free hours and no obvious way to give them away.
      - blockquote [ref=f1e37]:
        - paragraph [ref=f1e38]: “My father has a follow-up on Tuesday morning. I cannot take another day off, and he will not go by himself.”
        - paragraph [ref=f1e39]: A son in Brickfields
      - blockquote [ref=f1e40]:
        - paragraph [ref=f1e41]: “I have been alone most of this week. I do not need advice. I would just like someone to have tea with.”
        - paragraph [ref=f1e42]: A member in Petaling Jaya
      - blockquote [ref=f1e43]:
        - paragraph [ref=f1e44]: “I am free most Saturday mornings around Cheras. I have never known how to actually be useful with that.”
        - paragraph [ref=f1e45]: A volunteer in Cheras
    - generic [ref=f1e47]:
      - heading "Strangers meeting in real life. We treat that seriously." [level=2] [ref=f1e48]
      - paragraph [ref=f1e49]: A person checks every identity document — not an algorithm — and it is deleted 90 days after review.
      - paragraph [ref=f1e50]: Exact addresses and phone numbers stay hidden until both people accept, and every reveal is recorded.
      - paragraph [ref=f1e51]: A trusted contact is told when a session starts and when it ends safely.
      - paragraph [ref=f1e52]: "A safety button sits in every session: call 999, alert your trusted contact, report what is happening."
      - link "How safety works, in full" [ref=f1e53] [cursor=pointer]:
        - /url: /en/safety
    - generic [ref=f1e55]:
      - heading "Run with a community partner" [level=2] [ref=f1e56]
      - paragraph [ref=f1e57]: Teman is piloted with a senior-citizens organisation in Kuala Lumpur. Organisations recruit and vouch for volunteers; individuals always choose whether to connect.
      - link "Partner with Teman" [ref=f1e58] [cursor=pointer]:
        - /url: /en/organisations
  - contentinfo [ref=f1e59]:
    - generic [ref=f1e60]:
      - img "Teman" [ref=f1e61]
      - paragraph [ref=f1e65]: No one should have to go alone.
      - navigation [ref=f1e66]:
        - link "Need a Teman" [ref=f1e67] [cursor=pointer]:
          - /url: /en/need-a-teman
        - link "For organisations" [ref=f1e68] [cursor=pointer]:
          - /url: /en/organisations
        - link "About" [ref=f1e69] [cursor=pointer]:
          - /url: /en/about
        - link "Questions" [ref=f1e70] [cursor=pointer]:
          - /url: /en/faq
        - link "Privacy" [ref=f1e71] [cursor=pointer]:
          - /url: /en/privacy
        - link "Terms" [ref=f1e72] [cursor=pointer]:
          - /url: /en/terms
        - link "Contact" [ref=f1e73] [cursor=pointer]:
          - /url: /en/contact
      - paragraph [ref=f1e74]: In an emergency, call 999.
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('Teman Application', () => {
  4   |   test.beforeEach(async ({ page }) => {
  5   |     await page.goto('/');
  6   |   });
  7   | 
  8   |   test('should load the homepage', async ({ page }) => {
  9   |     // Wait for the page to load
  10  |     await page.waitForLoadState('networkidle');
  11  |     
  12  |     // Check if page title is present
  13  |     const title = page.locator('h1, [role="heading"]').first();
  14  |     await expect(title).toBeVisible();
  15  |   });
  16  | 
  17  |   test('should display language options', async ({ page }) => {
  18  |     // Check if language selector is visible
  19  |     const languageButton = page.locator('button:has-text("Language"), [data-testid="language-selector"]').first();
  20  |     
  21  |     // If language button exists, click and verify languages
  22  |     if (await languageButton.isVisible()) {
  23  |       await languageButton.click();
  24  |       
  25  |       // Check for language options
  26  |       const languages = ['English', 'Malay', 'Tamil', 'Chinese'];
  27  |       for (const lang of languages) {
  28  |         const option = page.locator(`text=${lang}`);
  29  |         await expect(option).toBeVisible();
  30  |       }
  31  |     }
  32  |   });
  33  | 
  34  |   test('should support text size controls', async ({ page }) => {
  35  |     // Look for text size controls
  36  |     const textSizeControl = page.locator('[data-testid="text-size-control"]');
  37  |     
  38  |     if (await textSizeControl.isVisible()) {
  39  |       // Check if we can adjust text size
  40  |       const sizeButtons = page.locator('[data-testid="text-size-option"]');
  41  |       const count = await sizeButtons.count();
  42  |       
  43  |       expect(count).toBeGreaterThanOrEqual(1);
  44  |     }
  45  |   });
  46  | 
  47  |   test('should persist user preferences', async ({ page, context }) => {
  48  |     // Set a preference (language or text size)
  49  |     const storageState = await context.storageState();
  50  |     
  51  |     // Navigate to a different page
> 52  |     await page.goto('/');
      |                ^ Error: page.goto: Test timeout of 30000ms exceeded.
  53  |     
  54  |     // Verify preference is persisted
  55  |     const newStorageState = await context.storageState();
  56  |     expect(newStorageState).toBeDefined();
  57  |   });
  58  | });
  59  | 
  60  | test.describe('Responsive Design', () => {
  61  |   test('should be responsive on mobile', async ({ page }) => {
  62  |     // Set mobile viewport
  63  |     await page.setViewportSize({ width: 375, height: 667 });
  64  |     await page.goto('/');
  65  |     
  66  |     // Wait for navigation to settle
  67  |     await page.waitForLoadState('networkidle');
  68  |     
  69  |     // Verify layout adapts to mobile
  70  |     const mainContent = page.locator('main, [role="main"]').first();
  71  |     await expect(mainContent).toBeVisible();
  72  |   });
  73  | 
  74  |   test('should be responsive on tablet', async ({ page }) => {
  75  |     // Set tablet viewport
  76  |     await page.setViewportSize({ width: 768, height: 1024 });
  77  |     await page.goto('/');
  78  |     
  79  |     await page.waitForLoadState('networkidle');
  80  |     
  81  |     const mainContent = page.locator('main, [role="main"]').first();
  82  |     await expect(mainContent).toBeVisible();
  83  |   });
  84  | 
  85  |   test('should be responsive on desktop', async ({ page }) => {
  86  |     // Set desktop viewport
  87  |     await page.setViewportSize({ width: 1920, height: 1080 });
  88  |     await page.goto('/');
  89  |     
  90  |     await page.waitForLoadState('networkidle');
  91  |     
  92  |     const mainContent = page.locator('main, [role="main"]').first();
  93  |     await expect(mainContent).toBeVisible();
  94  |   });
  95  | });
  96  | 
  97  | test.describe('Navigation', () => {
  98  |   test('should have accessible navigation', async ({ page }) => {
  99  |     await page.goto('/');
  100 |     
  101 |     // Check for navigation elements
  102 |     const nav = page.locator('nav, [role="navigation"]').first();
  103 |     
  104 |     if (await nav.isVisible()) {
  105 |       // Check for navigation links
  106 |       const links = page.locator('nav a, [role="navigation"] a');
  107 |       const count = await links.count();
  108 |       expect(count).toBeGreaterThanOrEqual(0);
  109 |     }
  110 |   });
  111 | 
  112 |   test('should navigate between pages', async ({ page }) => {
  113 |     await page.goto('/');
  114 |     
  115 |     // Look for a link and click it
  116 |     const links = page.locator('a[href^="/"]');
  117 |     const count = await links.count();
  118 |     
  119 |     if (count > 0) {
  120 |       await links.first().click();
  121 |       await page.waitForLoadState('networkidle');
  122 |       
  123 |       // Verify we navigated
  124 |       const url = page.url();
  125 |       expect(url).toContain('localhost:3001');
  126 |     }
  127 |   });
  128 | });
  129 | 
```