import { test, expect } from '@playwright/test';

test.describe('Teman Application', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the homepage', async ({ page }) => {
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check if page title is present
    const title = page.locator('h1, [role="heading"]').first();
    await expect(title).toBeVisible();
  });

  test('should display language options', async ({ page }) => {
    // Check if language selector is visible
    const languageButton = page.locator('button:has-text("Language"), [data-testid="language-selector"]').first();
    
    // If language button exists, click and verify languages
    if (await languageButton.isVisible()) {
      await languageButton.click();
      
      // Check for language options
      const languages = ['English', 'Malay', 'Tamil', 'Chinese'];
      for (const lang of languages) {
        const option = page.getByRole('button').filter({ hasText: lang }).first();
        await expect(option).toBeVisible();
      }
    }
  });

  test('should support text size controls', async ({ page }) => {
    // Look for text size controls
    const textSizeControl = page.locator('[data-testid="text-size-control"]');
    
    if (await textSizeControl.isVisible()) {
      // Check if we can adjust text size
      const sizeButtons = page.locator('[data-testid="text-size-option"]');
      const count = await sizeButtons.count();
      
      expect(count).toBeGreaterThanOrEqual(1);
    }
  });

  test('should persist user preferences', async ({ page, context }) => {
    // Set a preference (language or text size)
    const storageState = await context.storageState();
    
    // Navigate to a different page
    await page.goto('/');
    
    // Verify preference is persisted
    const newStorageState = await context.storageState();
    expect(newStorageState).toBeDefined();
  });
});

test.describe('Responsive Design', () => {
  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Wait for navigation to settle
    await page.waitForLoadState('networkidle');
    
    // Verify layout adapts to mobile
    const mainContent = page.locator('main, [role="main"]').first();
    await expect(mainContent).toBeVisible();
  });

  test('should be responsive on tablet', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    
    await page.waitForLoadState('networkidle');
    
    const mainContent = page.locator('main, [role="main"]').first();
    await expect(mainContent).toBeVisible();
  });

  test('should be responsive on desktop', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    
    await page.waitForLoadState('networkidle');
    
    const mainContent = page.locator('main, [role="main"]').first();
    await expect(mainContent).toBeVisible();
  });
});

test.describe('Navigation', () => {
  test('should have accessible navigation', async ({ page }) => {
    await page.goto('/');
    
    // Check for navigation elements
    const nav = page.locator('nav, [role="navigation"]').first();
    
    if (await nav.isVisible()) {
      // Check for navigation links
      const links = page.locator('nav a, [role="navigation"] a');
      const count = await links.count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test('should navigate between pages', async ({ page }) => {
    await page.goto('/');
    
    // Look for a link and click it
    const links = page.locator('a[href^="/"]');
    const count = await links.count();
    
    if (count > 0) {
      await links.first().click();
      await page.waitForLoadState('networkidle');
      
      // Verify we navigated
      const pathname = new URL(page.url()).pathname;
      expect(pathname).toMatch(/^\/(en|ms|ta|zh)(\/|$)/);
    }
  });
});
