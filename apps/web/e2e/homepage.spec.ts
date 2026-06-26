// FlockIQ — Homepage E2E Tests
// File: apps/web/e2e/homepage.spec.ts
// Task Reference: I-03
// Requirements: FR-HOME-001, FR-TECH-005

import { test, expect } from '@playwright/test';

test.describe('Homepage Critical Path', () => {
  test('should load homepage and render hero section in < 2s', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    const loadTime = Date.now() - startTime;
    
    // Hero section should be visible
    await expect(page.locator('h1')).toBeVisible();
    
    // Load time should be less than 2 seconds
    expect(loadTime).toBeLessThan(2000);
  });

  test('should have proper heading structure', async ({ page }) => {
    await page.goto('/');
    
    // Check H1 exists
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    
    // Check H1 contains expected text (Hindi or English)
    const h1Text = await h1.textContent();
    expect(h1Text).toBeTruthy();
    expect(h1Text?.length).toBeGreaterThan(0);
  });

  test('should have primary CTA button visible', async ({ page }) => {
    await page.goto('/');
    
    // Primary CTA should be visible
    const primaryCTA = page.getByRole('link', { name: /₹0 में शुरू करें|Start Free/i });
    await expect(primaryCTA).toBeVisible();
  });

  test('should have secondary CTA button visible', async ({ page }) => {
    await page.goto('/');
    
    // Secondary CTA should be visible
    const secondaryCTA = page.getByRole('link', { name: /Live Demo|Demo/i });
    await expect(secondaryCTA).toBeVisible();
  });

  test('should have navigation visible', async ({ page }) => {
    await page.goto('/');
    
    // Navigation should be visible
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
    
    // Logo should be present
    const logo = page.getByRole('link', { name: 'FlockIQ' });
    await expect(logo).toBeVisible();
  });

  test('should have social proof section', async ({ page }) => {
    await page.goto('/');
    
    // Social proof should be visible (customer count or testimonials)
    await expect(page.locator('text=/200\+|किसान|farmers/i')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Language Toggle', () => {
  test('should switch language from Hindi to English', async ({ page }) => {
    await page.goto('/');
    
    // Open mobile menu to access language toggle
    const hamburger = page.getByLabel('Open menu');
    await hamburger.click();
    
    // Click English button
    const englishButton = page.getByText('English');
    await englishButton.click();
    
    // Verify language switched (check for English text)
    await expect(page.getByText(/How It Works|Pricing/i)).toBeVisible();
  });

  test('should switch language from English to Hindi', async ({ page }) => {
    await page.goto('/');
    
    // Open mobile menu
    const hamburger = page.getByLabel('Open menu');
    await hamburger.click();
    
    // Click Hindi button
    const hindiButton = page.getByText('हिंदी');
    await hindiButton.click();
    
    // Verify language switched (check for Hindi text)
    await expect(page.getByText(/कैसे काम करता है|मूल्य/i)).toBeVisible();
  });
});

test.describe('Navigation Links', () => {
  test('all nav links should return 200 status', async ({ page, request }) => {
    await page.goto('/');
    
    // Get all nav links
    const navLinks = await page.locator('nav a').all();
    
    for (const link of navLinks) {
      const href = await link.getAttribute('href');
      if (href && href.startsWith('/')) {
        const response = await request.get(`http://localhost:3000${href}`);
        expect(response.status()).toBe(200);
      }
    }
  });

  test('should navigate to pricing page', async ({ page }) => {
    await page.goto('/');
    
    const pricingLink = page.getByRole('link', { name: /मूल्य|Pricing/i });
    await pricingLink.click();
    
    await expect(page).toHaveURL(/\/pricing/);
  });

  test('should navigate to accuracy section', async ({ page }) => {
    await page.goto('/');
    
    const accuracyLink = page.getByRole('link', { name: /सटीकता|Accuracy/i });
    await accuracyLink.click();
    
    await expect(page).toHaveURL(/.*accuracy/);
  });
});
