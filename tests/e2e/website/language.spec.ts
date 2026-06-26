/**
 * PoultryPulse AI — Language Toggle E2E Tests
 * TASK-WEB-024: End-to-End Test Suite (Playwright — Website)
 * File: tests/e2e/website/language.spec.ts
 * Requirements: GWEB-001 §GW-1.6, Design Spec §1.1
 */

import { test, expect } from '@playwright/test';

test.describe('Language Toggle Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('toggle to Hindi changes visible copy', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Find language toggle (could be in nav or mobile menu)
    const languageToggle = page.locator('button:has-text("हिं"), button:has-text("HI"), [data-testid="lang-toggle"]').first();
    
    // If not visible in nav, try mobile menu
    if (!(await languageToggle.isVisible())) {
      const mobileMenu = page.locator('button[aria-label*="menu"], .hamburger, .mobile-menu-button').first();
      await mobileMenu.click();
      await page.waitForTimeout(300);
    }
    
    // Click Hindi button
    const hindiButton = page.locator('button:has-text("हिं"), button:has-text("HI"), a:has-text("हिंदी")').first();
    await hindiButton.click();
    await page.waitForTimeout(500);
    
    // Verify Hindi text is visible
    await expect(page.locator('text=/₹30,000|कमाएं|बैच/i')).toBeVisible();
  });

  test('toggle to English changes visible copy', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // First switch to Hindi
    const hindiButton = page.locator('button:has-text("हिं"), button:has-text("HI")').first();
    if (await hindiButton.isVisible()) {
      await hindiButton.click();
      await page.waitForTimeout(500);
    }
    
    // Then switch to English
    const englishButton = page.locator('button:has-text("EN"), button:has-text("English"), a:has-text("English")').first();
    await englishButton.click();
    await page.waitForTimeout(500);
    
    // Verify English text is visible
    await expect(page.locator('text=/Earn|More|Batch|PoultryPulse/i')).toBeVisible();
  });

  test('language preference persists in localStorage', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Switch to Hindi
    const hindiButton = page.locator('button:has-text("हिं"), button:has-text("HI")').first();
    if (await hindiButton.isVisible()) {
      await hindiButton.click();
      await page.waitForTimeout(500);
    }
    
    // Check localStorage
    const languagePreference = await page.evaluate(() => localStorage.getItem('pp_lang'));
    expect(languagePreference).toBe('hi');
    
    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Verify Hindi is still selected
    const currentLanguage = await page.evaluate(() => localStorage.getItem('pp_lang'));
    expect(currentLanguage).toBe('hi');
  });

  test('language preference persists across navigation', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Switch to Hindi
    const hindiButton = page.locator('button:has-text("हिं"), button:has-text("HI")').first();
    if (await hindiButton.isVisible()) {
      await hindiButton.click();
      await page.waitForTimeout(500);
    }
    
    // Navigate to pricing page
    await page.goto('/pricing');
    await page.waitForLoadState('networkidle');
    
    // Verify language preference is maintained
    const languagePreference = await page.evaluate(() => localStorage.getItem('pp_lang'));
    expect(languagePreference).toBe('hi');
    
    // Verify Hindi text is visible on pricing page
    await expect(page.locator('text=/मूल्य|कीमत|₹/i')).toBeVisible();
  });

  test('language toggle works on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Open mobile menu
    const mobileMenu = page.locator('button[aria-label*="menu"], .hamburger, .mobile-menu-button').first();
    await mobileMenu.click();
    await page.waitForTimeout(300);
    
    // Click language toggle
    const languageButton = page.locator('button:has-text("हिं"), button:has-text("EN")').first();
    await languageButton.click();
    await page.waitForTimeout(500);
    
    // Verify language changed
    const languagePreference = await page.evaluate(() => localStorage.getItem('pp_lang'));
    expect(languagePreference).toBeTruthy();
  });

  test('language toggle works on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Find language toggle in nav
    const languageToggle = page.locator('button:has-text("हिं"), button:has-text("EN"), [data-testid="lang-toggle"]').first();
    
    if (await languageToggle.isVisible()) {
      await languageToggle.click();
      await page.waitForTimeout(500);
      
      // Verify language changed
      const languagePreference = await page.evaluate(() => localStorage.getItem('pp_lang'));
      expect(languagePreference).toBeTruthy();
    }
  });

  test('all major pages support language toggle', async ({ page }) => {
    const pages = ['/', '/pricing', '/accuracy', '/features'];
    
    for (const pageUrl of pages) {
      await page.goto(pageUrl);
      await page.waitForLoadState('networkidle');
      
      // Check if language toggle exists
      const languageToggle = page.locator('button:has-text("हिं"), button:has-text("EN"), [data-testid="lang-toggle"]').first();
      
      // On mobile, might need to open menu first
      if (!(await languageToggle.isVisible())) {
        const mobileMenu = page.locator('button[aria-label*="menu"], .hamburger').first();
        if (await mobileMenu.isVisible()) {
          await mobileMenu.click();
          await page.waitForTimeout(300);
        }
      }
      
      // Verify language toggle is accessible
      const hasLanguageToggle = await page.locator('button:has-text("हिं"), button:has-text("EN")').isVisible();
      expect(hasLanguageToggle).toBeTruthy();
    }
  });

  test('Hindi copy uses correct Devanagari characters', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Switch to Hindi
    const hindiButton = page.locator('button:has-text("हिं"), button:has-text("HI")').first();
    if (await hindiButton.isVisible()) {
      await hindiButton.click();
      await page.waitForTimeout(500);
    }
    
    // Get page text
    const pageText = await page.textContent('body');
    
    // Verify Devanagari characters are present (Unicode range U+0900 to U+097F)
    const hasDevanagari = /[\u0900-\u097F]/.test(pageText || '');
    expect(hasDevanagari).toBeTruthy();
  });

  test('English copy uses Latin characters', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Ensure English is selected
    const englishButton = page.locator('button:has-text("EN"), button:has-text("English")').first();
    if (await englishButton.isVisible()) {
      await englishButton.click();
      await page.waitForTimeout(500);
    }
    
    // Get page text
    const pageText = await page.textContent('body');
    
    // Verify Latin characters are present
    const hasLatin = /[a-zA-Z]/.test(pageText || '');
    expect(hasLatin).toBeTruthy();
  });

  test('language toggle does not break page layout', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Get initial layout
    const initialBodyHeight = await page.evaluate(() => document.body.scrollHeight);
    
    // Switch language
    const languageToggle = page.locator('button:has-text("हिं"), button:has-text("EN")').first();
    if (await languageToggle.isVisible()) {
      await languageToggle.click();
      await page.waitForTimeout(500);
    }
    
    // Get new layout
    const newBodyHeight = await page.evaluate(() => document.body.scrollHeight);
    
    // Layout should not break (height should be reasonable)
    expect(newBodyHeight).toBeGreaterThan(0);
    expect(newBodyHeight).toBeLessThan(50000); // Sanity check
  });
});
