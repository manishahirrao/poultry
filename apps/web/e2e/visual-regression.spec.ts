// FlockIQ — Visual Regression Tests
// File: apps/web/e2e/visual-regression.spec.ts
// Task Reference: I-04
// Requirements: FR-TECH-005

import { test, expect } from '@playwright/test';

test.describe('Visual Regression - Desktop', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('homepage hero section - desktop 1440px', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(page).toHaveScreenshot('hero-desktop-1440.png', {
      maxDiffPixels: 100,
      threshold: 0.01,
    });
  });

  test('homepage hero section - desktop 1280px', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(page).toHaveScreenshot('hero-desktop-1280.png', {
      maxDiffPixels: 100,
      threshold: 0.01,
    });
  });

  test('pricing page - desktop', async ({ page }) => {
    await page.goto('/pricing');
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(page).toHaveScreenshot('pricing-desktop.png', {
      maxDiffPixels: 100,
      threshold: 0.01,
    });
  });

  test('accuracy page - desktop', async ({ page }) => {
    await page.goto('/accuracy');
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(page).toHaveScreenshot('accuracy-desktop.png', {
      maxDiffPixels: 100,
      threshold: 0.01,
    });
  });
});

test.describe('Visual Regression - Mobile', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('homepage hero section - mobile 390px', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page).toHaveScreenshot('hero-mobile-390.png', {
      maxDiffPixels: 100,
      threshold: 0.01,
    });
  });

  test('homepage hero section - mobile 414px', async ({ page }) => {
    await page.setViewportSize({ width: 414, height: 896 });
    await expect(page).toHaveScreenshot('hero-mobile-414.png', {
      maxDiffPixels: 100,
      threshold: 0.01,
    });
  });

  test('pricing page - mobile', async ({ page }) => {
    await page.goto('/pricing');
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page).toHaveScreenshot('pricing-mobile.png', {
      maxDiffPixels: 100,
      threshold: 0.01,
    });
  });

  test('accuracy page - mobile', async ({ page }) => {
    await page.goto('/accuracy');
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page).toHaveScreenshot('accuracy-mobile.png', {
      maxDiffPixels: 100,
      threshold: 0.01,
    });
  });
});

test.describe('Visual Regression - Navigation', () => {
  test('desktop navigation - scrolled state', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    
    // Scroll to trigger nav shrink
    await page.evaluate(() => window.scrollTo(0, 100));
    await page.waitForTimeout(500);
    
    await expect(page.locator('nav')).toHaveScreenshot('nav-scrolled-desktop.png', {
      maxDiffPixels: 50,
      threshold: 0.01,
    });
  });

  test('mobile navigation - open state', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    
    // Open mobile menu
    const hamburger = page.getByLabel('Open menu');
    await hamburger.click();
    await page.waitForTimeout(500);
    
    await expect(page).toHaveScreenshot('nav-mobile-open.png', {
      maxDiffPixels: 100,
      threshold: 0.01,
    });
  });
});

test.describe('Visual Regression - Components', () => {
  test('FAQ accordion - closed state', async ({ page }) => {
    await page.goto('/');
    await page.setViewportSize({ width: 1440, height: 900 });
    
    // Scroll to FAQ section
    await page.locator('text=/FAQ|सवाल/i').scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    
    await expect(page.locator('section').filter({ hasText: /FAQ|सवाल/i })).toHaveScreenshot('faq-closed.png', {
      maxDiffPixels: 100,
      threshold: 0.01,
    });
  });

  test('FAQ accordion - open state', async ({ page }) => {
    await page.goto('/');
    await page.setViewportSize({ width: 1440, height: 900 });
    
    // Scroll to FAQ section
    await page.locator('text=/FAQ|सवाल/i').scrollIntoViewIfNeeded();
    
    // Open first FAQ item
    const firstButton = page.locator('button').filter({ hasText: /FlockIQ|सटीक/i }).first();
    await firstButton.click();
    await page.waitForTimeout(500);
    
    await expect(page.locator('section').filter({ hasText: /FAQ|सवाल/i })).toHaveScreenshot('faq-open.png', {
      maxDiffPixels: 100,
      threshold: 0.01,
    });
  });

  test('pricing cards - desktop', async ({ page }) => {
    await page.goto('/pricing');
    await page.setViewportSize({ width: 1440, height: 900 });
    
    await expect(page.locator('section').filter({ hasText: /PulseFarm|PulsePro/i })).toHaveScreenshot('pricing-cards.png', {
      maxDiffPixels: 100,
      threshold: 0.01,
    });
  });
});
