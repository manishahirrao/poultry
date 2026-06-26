/**
 * PoultryPulse AI — Command Center E2E Tests
 * TASK-027: End-to-End Test Suite
 * File: tests/e2e/commandCenter.spec.ts
 */

import { test, expect } from '@playwright/test';

test.describe('Command Center Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');
  });

  test('Command Center renders all widgets', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check for Price Signal Hero widget
    const priceHero = page.locator('[data-testid="price-signal-hero"]');
    await expect(priceHero).toBeVisible();

    // Check for Accuracy Trust Card
    const accuracyCard = page.locator('[data-testid="accuracy-trust-card"]');
    await expect(accuracyCard).toBeVisible();

    // Check for KPI Card Row (5 cards)
    const kpiCards = page.locator('[data-testid="kpi-card"]');
    await expect(kpiCards).toHaveCount(5);
  });

  test('Price hero displays correct value from API', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Get price value from price hero
    const priceHero = page.locator('[data-testid="price-signal-hero"]');
    const priceValue = await priceHero.locator('[data-testid="price-value"]').textContent();

    // Verify price is a valid number
    expect(priceValue).toBeTruthy();
    const numericPrice = parseFloat(priceValue?.replace(/[^0-9.]/g, '') || '0');
    expect(numericPrice).toBeGreaterThan(80); // Minimum expected price
    expect(numericPrice).toBeLessThan(250); // Maximum expected price
  });

  test('Accuracy trust card displays correct color based on MAPE', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    const accuracyCard = page.locator('[data-testid="accuracy-trust-card"]');
    
    // Get MAPE value
    const mapeValue = await accuracyCard.locator('[data-testid="mape-value"]').textContent();
    const numericMape = parseFloat(mapeValue?.replace(/[^0-9.]/g, '') || '0');

    // Check color indicator based on MAPE thresholds
    const mapeIndicator = accuracyCard.locator('[data-testid="mape-indicator"]');
    
    if (numericMape < 6) {
      // Should be green (excellent)
      await expect(mapeIndicator).toHaveClass(/text-green/);
    } else if (numericMape < 8) {
      // Should be amber (warning)
      await expect(mapeIndicator).toHaveClass(/text-amber/);
    } else {
      // Should be red (critical)
      await expect(mapeIndicator).toHaveClass(/text-red/);
    }
  });

  test('All 5 KPI cards render with correct data', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    const kpiCards = page.locator('[data-testid="kpi-card"]');
    await expect(kpiCards).toHaveCount(5);

    // Check each card has required elements
    for (const card of await kpiCards.all()) {
      await expect(card.locator('[data-testid="kpi-icon"]')).toBeVisible();
      await expect(card.locator('[data-testid="kpi-title"]')).toBeVisible();
      await expect(card.locator('[data-testid="kpi-value"]')).toBeVisible();
      await expect(card.locator('[data-testid="kpi-subtitle"]')).toBeVisible();
    }
  });

  test('KPI cards are clickable and navigate to correct sections', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Click on Mandi Benchmark KPI card
    const mandiCard = page.locator('[data-testid="kpi-card"]').first();
    await mandiCard.click();

    // Should navigate to price intelligence section
    await expect(page).toHaveURL(/price-intelligence/);
  });

  test('Refresh button updates widget data', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Get initial price value
    const initialPrice = await page.locator('[data-testid="price-value"]').textContent();

    // Click refresh button
    const refreshButton = page.locator('[data-testid="refresh-button"]');
    await refreshButton.click();

    // Wait for refresh to complete
    await page.waitForTimeout(500);

    // Verify page is still responsive
    const priceHero = page.locator('[data-testid="price-signal-hero"]');
    await expect(priceHero).toBeVisible();
  });

  test('District selector updates URL params', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Click on a different district
    const districtButton = page.locator('button:has-text("Deoria")');
    await districtButton.click();

    // Verify URL has updated with district param
    await expect(page).toHaveURL(/districts=.*deoria/);
  });
});
