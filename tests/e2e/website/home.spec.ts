/**
 * PoultryPulse AI — Homepage E2E Tests
 * TASK-WEB-024: End-to-End Test Suite (Playwright — Website)
 * File: tests/e2e/website/home.spec.ts
 * Requirements: REQ-WEB-001, Design Spec §3.1–§3.9
 */

import { test, expect } from '@playwright/test';

test.describe('Homepage Critical Path', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('page loads and accuracy badge shows', async ({ page }) => {
    // Check accuracy badge is visible
    const accuracyBadge = page.locator('[data-testid="accuracy-badge"], .accuracy-badge, text=/96\\.2%|MAPE|Directional/i').first();
    await expect(accuracyBadge).toBeVisible({ timeout: 5000 });
    
    // Verify accuracy stats are displayed
    await expect(page.locator('text=/96\\.2%|95%|सटीकता|accuracy/i')).toBeVisible();
  });

  test('hero CTA navigates to login', async ({ page }) => {
    // Find primary CTA button (Hindi or English)
    const heroCTA = page.locator('a[href*="/login"], button:has-text("शुरू करें"), button:has-text("Start"), button:has-text("Free Trial")').first();
    await expect(heroCTA).toBeVisible();
    
    // Click CTA and verify navigation
    await heroCTA.click();
    await expect(page).toHaveURL(/\/login|\/signup/);
  });

  test('ROI calculator updates on input', async ({ page }) => {
    // Scroll to ROI calculator
    const roiCalculator = page.locator('[data-testid="roi-calculator"], .roi-calculator, section:has-text("कमाई"), section:has-text("Earnings")').first();
    await roiCalculator.scrollIntoViewIfNeeded();
    await expect(roiCalculator).toBeVisible();
    
    // Find flock size dropdown
    const flockSizeSelect = page.locator('select[name*="flock"], select[name*="birds"], .flock-size-select').first();
    if (await flockSizeSelect.isVisible()) {
      // Get initial value
      const initialOutput = page.locator('[data-testid="roi-output"], .roi-output, text=/₹/').first();
      const initialText = await initialOutput.textContent();
      
      // Change flock size
      await flockSizeSelect.selectOption('25000');
      
      // Verify output updates (wait for animation)
      await page.waitForTimeout(500);
      const updatedText = await initialOutput.textContent();
      expect(updatedText).not.toBe(initialText);
    }
  });

  test('feature tabs switch with animation', async ({ page }) => {
    // Find feature tab section
    const featureTabs = page.locator('[data-testid="feature-tabs"], .feature-tabs, [role="tablist"]').first();
    await featureTabs.scrollIntoViewIfNeeded();
    await expect(featureTabs).toBeVisible();
    
    // Get first tab
    const firstTab = page.locator('[role="tab"], .tab-button').first();
    await expect(firstTab).toBeVisible();
    
    // Click second tab
    const secondTab = page.locator('[role="tab"], .tab-button').nth(1);
    await secondTab.click();
    
    // Verify tab content changes (wait for animation)
    await page.waitForTimeout(400);
    
    // Check that active tab styling is applied
    await expect(secondTab).toHaveClass(/active|selected/);
  });

  test('page loads in under 2 seconds', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    const loadTime = Date.now() - startTime;
    
    // LCP should be under 2 seconds
    expect(loadTime).toBeLessThan(2000);
    
    // Hero section should be visible
    await expect(page.locator('h1')).toBeVisible();
  });

  test('problem cards are displayed', async ({ page }) => {
    // Scroll to problem section
    const problemSection = page.locator('section:has-text("समस्या"), section:has-text("Problem"), .problem-cards').first();
    await problemSection.scrollIntoViewIfNeeded();
    
    // Check for at least 3 problem cards
    const problemCards = page.locator('.problem-card, .pain-card').all();
    const count = await (await problemCards).length;
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('feature grid displays all features', async ({ page }) => {
    // Scroll to feature grid
    const featureGrid = page.locator('.feature-grid, .features-grid').first();
    await featureGrid.scrollIntoViewIfNeeded();
    
    // Check for feature cards
    const featureCards = page.locator('.feature-card').all();
    const count = await (await featureCards).length;
    expect(count).toBeGreaterThanOrEqual(12);
  });

  test('testimonials section is displayed', async ({ page }) => {
    // Scroll to testimonials
    const testimonials = page.locator('.testimonials, .testimonial-section').first();
    await testimonials.scrollIntoViewIfNeeded();
    await expect(testimonials).toBeVisible();
    
    // Check for at least 3 testimonial cards
    const testimonialCards = page.locator('.testimonial-card').all();
    const count = await (await testimonialCards).length;
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('segment cards are displayed', async ({ page }) => {
    // Scroll to segment cards
    const segmentCards = page.locator('.segment-cards, .solutions-cards').first();
    await segmentCards.scrollIntoViewIfNeeded();
    await expect(segmentCards).toBeVisible();
    
    // Check for segment CTAs
    const segmentLinks = page.locator('a[href*="/solutions"], a[href*="/commercial"], a[href*="/integrators"]').all();
    const count = await (await segmentLinks).length;
    expect(count).toBeGreaterThan(0);
  });

  test('final CTA section is displayed', async ({ page }) => {
    // Scroll to final CTA
    const finalCTA = page.locator('.final-cta, .cta-section:has-text("शुरू करें")').first();
    await finalCTA.scrollIntoViewIfNeeded();
    await expect(finalCTA).toBeVisible();
    
    // Check for CTA button
    const ctaButton = finalCTA.locator('button, a').filter({ hasText: /शुरू करें|Start|Begin/i });
    await expect(ctaButton).toBeVisible();
  });
});

test.describe('Homepage Responsive Design', () => {
  test('homepage works on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Hero should be visible
    await expect(page.locator('h1')).toBeVisible();
    
    // Mobile menu should be present
    const mobileMenu = page.locator('button[aria-label*="menu"], .hamburger, .mobile-menu-button').first();
    await expect(mobileMenu).toBeVisible();
  });

  test('homepage works on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Hero should be visible
    await expect(page.locator('h1')).toBeVisible();
    
    // Feature grid should adapt
    const featureGrid = page.locator('.feature-grid').first();
    await featureGrid.scrollIntoViewIfNeeded();
    await expect(featureGrid).toBeVisible();
  });

  test('homepage works on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Hero should be visible
    await expect(page.locator('h1')).toBeVisible();
    
    // Navigation should be visible
    const nav = page.locator('nav').first();
    await expect(nav).toBeVisible();
  });
});
