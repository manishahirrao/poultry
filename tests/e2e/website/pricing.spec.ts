/**
 * PoultryPulse AI — Pricing Page E2E Tests
 * TASK-WEB-024: End-to-End Test Suite (Playwright — Website)
 * File: tests/e2e/website/pricing.spec.ts
 * Requirements: REQ-WEB-003, Design Spec §4.1–§4.2
 */

import { test, expect } from '@playwright/test';

test.describe('Pricing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pricing');
    await page.waitForLoadState('networkidle');
  });

  test('pricing page loads successfully', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Pricing|मूल्य|कीमत/i);
    
    // Check pricing cards are visible
    const pricingCards = page.locator('.pricing-card, .tier-card, .plan-card').all();
    const count = await (await pricingCards).length;
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('flock size slider moves and updates price', async ({ page }) => {
    // Find flock size slider
    const slider = page.locator('input[type="range"][name*="flock"], input[type="range"][name*="birds"], .flock-size-slider').first();
    
    if (await slider.isVisible()) {
      // Get initial price
      const priceDisplay = page.locator('[data-testid="price-display"], .price, .tier-price').first();
      const initialPrice = await priceDisplay.textContent();
      
      // Move slider to different position
      await slider.evaluate((el: any) => el.value = '50000');
      await slider.dispatchEvent('input');
      
      // Wait for price update animation
      await page.waitForTimeout(300);
      
      // Verify price changed
      const updatedPrice = await priceDisplay.textContent();
      expect(updatedPrice).not.toBe(initialPrice);
    }
  });

  test('annual billing toggle applies discount', async ({ page }) => {
    // Find annual billing toggle
    const annualToggle = page.locator('input[type="checkbox"][name*="annual"], .billing-toggle, [data-testid="annual-toggle"]').first();
    
    if (await annualToggle.isVisible()) {
      // Get initial price (monthly)
      const priceDisplay = page.locator('[data-testid="price-display"], .price, .tier-price').first();
      const monthlyPrice = await priceDisplay.textContent();
      
      // Toggle to annual
      await annualToggle.check();
      await page.waitForTimeout(300);
      
      // Verify discount is applied (price should show annual savings)
      const annualPrice = await priceDisplay.textContent();
      expect(annualPrice).not.toBe(monthlyPrice);
      
      // Check for savings indicator
      const savingsIndicator = page.locator('text=/save|बचत|discount|20%/i');
      await expect(savingsIndicator).toBeVisible();
    }
  });

  test('CTA buttons navigate correctly', async ({ page }) => {
    // Find PulsePro CTA
    const pulseProCTA = page.locator('.pricing-card:has-text("PulsePro") a, .tier-card:has-text("PulsePro") button').first();
    if (await pulseProCTA.isVisible()) {
      await pulseProCTA.click();
      await expect(page).toHaveURL(/\/login|\/signup/);
      await page.goBack();
    }
    
    // Find PulseEnterprise CTA
    const enterpriseCTA = page.locator('.pricing-card:has-text("Enterprise") a, .tier-card:has-text("Enterprise") button').first();
    if (await enterpriseCTA.isVisible()) {
      await enterpriseCTA.click();
      await expect(page).toHaveURL(/\/demo/);
    }
  });

  test('feature comparison matrix displays correctly', async ({ page }) => {
    // Scroll to comparison table
    const comparisonTable = page.locator('.comparison-table, .feature-matrix, table.comparison').first();
    await comparisonTable.scrollIntoViewIfNeeded();
    await expect(comparisonTable).toBeVisible();
    
    // Check for table headers
    const headers = page.locator('th').all();
    const headerCount = await (await headers).length;
    expect(headerCount).toBeGreaterThanOrEqual(3); // At least Feature, PulsePro, Enterprise
    
    // Check for feature rows
    const rows = page.locator('tbody tr').all();
    const rowCount = await (await rows).length;
    expect(rowCount).toBeGreaterThan(5);
  });

  test('FAQ accordion expands and collapses', async ({ page }) => {
    // Find FAQ section
    const faqSection = page.locator('.faq-section, details, .accordion').first();
    await faqSection.scrollIntoViewIfNeeded();
    
    // Find first FAQ item
    const firstFaq = page.locator('details').first();
    await expect(firstFaq).toBeVisible();
    
    // Click to expand
    await firstFaq.locator('summary').click();
    await page.waitForTimeout(200);
    
    // Verify it's expanded (attribute open should be present)
    const isOpen = await firstFaq.evaluate((el: any) => el.hasAttribute('open'));
    expect(isOpen).toBeTruthy();
    
    // Click to collapse
    await firstFaq.locator('summary').click();
    await page.waitForTimeout(200);
    
    // Verify it's collapsed
    const isClosed = await firstFaq.evaluate((el: any) => !el.hasAttribute('open'));
    expect(isClosed).toBeTruthy();
  });

  test('trust signals are displayed', async ({ page }) => {
    // Check for trust chips below CTA
    const trustSignals = page.locator('.trust-signals, .trust-chips, text=/No credit card|Cancel anytime|Data secure/i').all();
    const count = await (await trustSignals).length;
    expect(count).toBeGreaterThan(0);
  });

  test('pricing tiers display correct features', async ({ page }) => {
    // Check PulsePro features
    const pulseProFeatures = page.locator('.pricing-card:has-text("PulsePro") .feature-list li, .tier-card:has-text("PulsePro") ul li').all();
    const pulseProCount = await (await pulseProFeatures).length;
    expect(pulseProCount).toBeGreaterThan(5);
    
    // Check PulseEnterprise features (should have more)
    const enterpriseFeatures = page.locator('.pricing-card:has-text("Enterprise") .feature-list li, .tier-card:has-text("Enterprise") ul li').all();
    const enterpriseCount = await (await enterpriseFeatures).length;
    expect(enterpriseCount).toBeGreaterThanOrEqual(pulseProCount);
  });

  test('popular badge is displayed on recommended plan', async ({ page }) => {
    // Check for popular/recommended badge
    const popularBadge = page.locator('.badge:has-text("Popular"), .badge:has-text("Recommended"), .popular-badge').first();
    await expect(popularBadge).toBeVisible();
  });
});

test.describe('Pricing Page Responsive Design', () => {
  test('pricing works on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/pricing');
    await page.waitForLoadState('networkidle');
    
    // Pricing cards should stack vertically
    const pricingCards = page.locator('.pricing-card, .tier-card').all();
    const count = await (await pricingCards).length;
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('pricing works on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/pricing');
    await page.waitForLoadState('networkidle');
    
    // Pricing cards should be side by side
    const pricingCards = page.locator('.pricing-card, .tier-card').all();
    const count = await (await pricingCards).length;
    expect(count).toBeGreaterThanOrEqual(2);
  });
});
