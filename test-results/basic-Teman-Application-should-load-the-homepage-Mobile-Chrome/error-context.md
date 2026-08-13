# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: basic.spec.ts >> Teman Application >> should load the homepage
- Location: tests/e2e/basic.spec.ts:8:7

# Error details

```
Error: page.goto: net::ERR_CONNECTION_RESET at http://localhost:3001/
Call log:
  - navigating to "http://localhost:3001/", waiting until "load"

```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('Teman Application', () => {
  4   |   test.beforeEach(async ({ page }) => {
> 5   |     await page.goto('/');
      |                ^ Error: page.goto: net::ERR_CONNECTION_RESET at http://localhost:3001/
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
  52  |     await page.goto('/');
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
```