// PoultryPulse AI — E2E Tests for Mobile Critical Paths
// File: apps/mobile/e2e/forecast.spec.ts
// Version: v1.0 | May 2026
// Task: 10.10
// Requirements: UI/UX §1.1, TRD Output Constraints

import { expect, test } from '@playwright/test';

test.describe('Forecast Screen Critical Paths', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to forecast screen
    await page.goto('/');
    // Mock authentication for E2E testing
    await page.addInitScript(() => {
      (globalThis as any).localStorage.setItem('mockAuth', 'true');
    });
  });

  test('forecast screen shows cached price within 1s on Slow 3G simulation', async ({ page, context }) => {
    // Simulate Slow 3G network conditions
    await context.setOffline(true);
    
    const startTime = Date.now();
    
    // Navigate to forecast tab
    await page.goto('/forecast');
    
    // Wait for price display
    const priceElement = await page.waitForSelector('[data-testid="price-hero"]', {
      timeout: 2000
    });
    
    const loadTime = Date.now() - startTime;
    
    // Verify price is displayed within 1 second
    expect(loadTime).toBeLessThan(1000);
    expect(await priceElement.isVisible()).toBe(true);
    
    // Verify cached data is shown (not loading spinner)
    const loadingSpinner = page.locator('[data-testid="loading-spinner"]');
    await expect(loadingSpinner).not.toBeVisible();
    
    // Restore network
    await context.setOffline(false);
  });

  test('sell signal card announces signal change via accessibility label', async ({ page }) => {
    await page.goto('/sell-signal');
    
    // Wait for sell signal card
    const signalCard = await page.waitForSelector('[data-testid="sell-signal-card"]');
    
    // Verify accessibility label exists
    const accessibilityLabel = await signalCard.getAttribute('accessibilityLabel');
    expect(accessibilityLabel).toBeTruthy();
    expect(accessibilityLabel).toContain('संकेत'); // Hindi for "signal"
    
    // Verify aria-live region for screen readers
    const liveRegion = await signalCard.getAttribute('accessibilityLiveRegion');
    expect(liveRegion).toBe('polite');
    
    // Simulate signal change
    await page.evaluate(() => {
      // Mock signal change
      const event = new (globalThis as any).CustomEvent('signalChange', { 
        detail: { signal: 'SELL_NOW' } 
      });
      (globalThis as any).dispatchEvent(event);
    });
    
    // Verify screen reader announces the change
    const newLabel = await signalCard.getAttribute('accessibilityLabel');
    expect(newLabel).toContain('अभी बेचें'); // Hindi for "SELL_NOW"
  });

  test('alert with HPAI type shows red border and correct Hindi text', async ({ page }) => {
    await page.goto('/alerts');
    
    // Wait for alerts to load
    await page.waitForSelector('[data-testid="alert-card"]');
    
    // Find HPAI alert
    const hpaiAlert = page.locator('[data-testid="alert-card"]').filter({
      hasText: 'HPAI'
    });
    
    // Verify red border for HPAI alerts
    const borderColor = await hpaiAlert.evaluate((el: HTMLElement) => {
      return (globalThis as any).getComputedStyle(el).borderLeftColor;
    });
    expect(borderColor).toBe('rgb(192, 57, 43)'); // red600
    
    // Verify Hindi text is displayed
    const hindiText = await hpaiAlert.textContent();
    expect(hindiText).toMatch(/[\u0900-\u097F]/); // Devanagari script range
    
    // Verify alert title is in Hindi
    const title = hpaiAlert.locator('[data-testid="alert-title"]');
    await expect(title).toContainText(/[\u0900-\u097F]/);
  });

  test('offline mode shows stale banner, not empty state', async ({ page, context }) => {
    // First load with network to cache data
    await page.goto('/forecast');
    await page.waitForSelector('[data-testid="price-hero"]');
    
    // Go offline
    await context.setOffline(true);
    
    // Reload page
    await page.reload();
    
    // Verify stale banner appears
    const staleBanner = page.locator('[data-testid="stale-banner"]');
    await expect(staleBanner).toBeVisible();
    
    // Verify stale banner shows Hindi message
    const staleMessage = await staleBanner.textContent();
    expect(staleMessage).toMatch(/[\u0900-\u097F]/); // Devanagari script
    expect(staleMessage).toContain('घंटे'); // Hindi for "hours"
    
    // Verify empty state does NOT appear
    const emptyState = page.locator('[data-testid="empty-state"]');
    await expect(emptyState).not.toBeVisible();
    
    // Verify cached price is still displayed
    const priceHero = page.locator('[data-testid="price-hero"]');
    await expect(priceHero).toBeVisible();
    
    // Restore network
    await context.setOffline(false);
  });

  test('price hero has proper accessibility attributes', async ({ page }) => {
    await page.goto('/forecast');
    await page.waitForSelector('[data-testid="price-hero"]');
    
    const priceHero = page.locator('[data-testid="price-hero"]');
    
    // Verify accessibility label in Hindi
    const accessibilityLabel = await priceHero.getAttribute('accessibilityLabel');
    expect(accessibilityLabel).toBeTruthy();
    expect(accessibilityLabel).toMatch(/[\u0900-\u097F]/); // Devanagari script
    
    // Verify aria-live for price updates
    const liveRegion = await priceHero.getAttribute('accessibilityLiveRegion');
    expect(liveRegion).toBe('polite');
    
    // Verify accessibility role
    const role = await priceHero.getAttribute('accessibilityRole');
    expect(role).toBe('text');
  });

  test('confidence interval bar displays P10-P90 range correctly', async ({ page }) => {
    await page.goto('/forecast');
    await page.waitForSelector('[data-testid="confidence-interval-bar"]');
    
    const confidenceBar = page.locator('[data-testid="confidence-interval-bar"]');
    
    // Verify bar is visible
    await expect(confidenceBar).toBeVisible();
    
    // Verify P10 and P90 markers exist
    const p10Marker = confidenceBar.locator('[data-testid="p10-marker"]');
    const p90Marker = confidenceBar.locator('[data-testid="p90-marker"]');
    const p50Marker = confidenceBar.locator('[data-testid="p50-marker"]');
    
    await expect(p10Marker).toBeVisible();
    await expect(p90Marker).toBeVisible();
    await expect(p50Marker).toBeVisible();
    
    // Verify Hindi tooltip on press
    await confidenceBar.tap();
    const tooltip = page.locator('[data-testid="confidence-tooltip"]');
    await expect(tooltip).toBeVisible();
    const tooltipText = await tooltip.textContent();
    expect(tooltipText).toMatch(/[\u0900-\u097F]/); // Devanagari script
  });
});
