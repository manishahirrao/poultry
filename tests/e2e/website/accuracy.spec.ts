/**
 * PoultryPulse AI — Accuracy Page E2E Tests
 * TASK-WEB-024: End-to-End Test Suite (Playwright — Website)
 * File: tests/e2e/website/accuracy.spec.ts
 * Requirements: REQ-WEB-004, Design Spec §5.1–§5.4
 */

import { test, expect } from '@playwright/test';

test.describe('Accuracy Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/accuracy');
    await page.waitForLoadState('networkidle');
  });

  test('accuracy page loads successfully', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Accuracy|सटीकता|Proof/i);
    
    // Check hero section is visible
    const heroSection = page.locator('section:has-text("Accuracy"), .accuracy-hero').first();
    await expect(heroSection).toBeVisible();
  });

  test('live accuracy stats are visible', async ({ page }) => {
    // Check for directional accuracy stat
    const directionalAccuracy = page.locator('text=/96\\.2%|Directional|दिशात्मक/i').first();
    await expect(directionalAccuracy).toBeVisible();
    
    // Check for MAPE stat
    const mapeStat = page.locator('text=/MAPE|4\\.8%/i').first();
    await expect(mapeStat).toBeVisible();
    
    // Check for conformal coverage stat
    const conformalCoverage = page.locator('text=/Conformal|Coverage|80\\.1%/i').first();
    await expect(conformalCoverage).toBeVisible();
    
    // Check for predictions verified stat
    const predictionsVerified = page.locator('text=/847|Predictions|पूर्वानुमान/i').first();
    await expect(predictionsVerified).toBeVisible();
  });

  test('accuracy chart renders', async ({ page }) => {
    // Scroll to chart section
    const chartSection = page.locator('.chart-section, .accuracy-chart, [data-testid="accuracy-chart"]').first();
    await chartSection.scrollIntoViewIfNeeded();
    
    // Wait for chart to render (Recharts uses canvas or SVG)
    await page.waitForTimeout(1000);
    
    // Check for chart container
    const chartContainer = page.locator('canvas, svg.recharts-wrapper, .recharts-surface').first();
    await expect(chartContainer).toBeVisible();
  });

  test('prediction history table has 30 rows', async ({ page }) => {
    // Scroll to prediction table
    const predictionTable = page.locator('.prediction-table, table:has-text("Prediction"), table:has-text("पूर्वानुमान")').first();
    await predictionTable.scrollIntoViewIfNeeded();
    await expect(predictionTable).toBeVisible();
    
    // Count table rows (excluding header)
    const tableRows = page.locator('tbody tr').all();
    const rowCount = await (await tableRows).length;
    expect(rowCount).toBeGreaterThanOrEqual(30);
  });

  test('prediction table shows correct direction indicators', async ({ page }) => {
    // Scroll to prediction table
    const predictionTable = page.locator('.prediction-table, table:has-text("Prediction")').first();
    await predictionTable.scrollIntoViewIfNeeded();
    
    // Check for correct direction indicators (green checkmarks)
    const correctIndicators = page.locator('text=/✓|✅|Correct/i').all();
    const correctCount = await (await correctIndicators).length;
    expect(correctCount).toBeGreaterThan(0);
  });

  test('methodology accordion opens', async ({ page }) => {
    // Find methodology section
    const methodologySection = page.locator('.methodology-section, .accordion, details').first();
    await methodologySection.scrollIntoViewIfNeeded();
    
    // Find first accordion item
    const firstAccordion = page.locator('details').first();
    await expect(firstAccordion).toBeVisible();
    
    // Click to expand
    await firstAccordion.locator('summary').click();
    await page.waitForTimeout(200);
    
    // Verify it's expanded
    const isOpen = await firstAccordion.evaluate((el: any) => el.hasAttribute('open'));
    expect(isOpen).toBeTruthy();
  });

  test('feature importance visual displays', async ({ page }) => {
    // Scroll to feature importance section
    const featureImportance = page.locator('.feature-importance, .shap-chart, [data-testid="feature-importance"]').first();
    await featureImportance.scrollIntoViewIfNeeded();
    
    // Wait for chart to render
    await page.waitForTimeout(500);
    
    // Check for feature importance bars or chart
    const bars = page.locator('.bar, .feature-bar').all();
    const barCount = await (await bars).length;
    expect(barCount).toBeGreaterThan(0);
  });

  test('stress test results are displayed', async ({ page }) => {
    // Scroll to stress test section
    const stressTestSection = page.locator('.stress-test, .historical-events, [data-testid="stress-test"]').first();
    await stressTestSection.scrollIntoViewIfNeeded();
    await expect(stressTestSection).toBeVisible();
    
    // Check for at least 3 historical events
    const eventCards = page.locator('.event-card, .stress-test-card').all();
    const eventCount = await (await eventCards).length;
    expect(eventCount).toBeGreaterThanOrEqual(3);
  });

  test('download accuracy report button works', async ({ page }) => {
    // Find download button
    const downloadButton = page.locator('a:has-text("Download"), button:has-text("Download"), a:has-text("Report")').first();
    
    if (await downloadButton.isVisible()) {
      // Verify button has href attribute
      const href = await downloadButton.getAttribute('href');
      expect(href).toBeTruthy();
      expect(href).toMatch(/\\.pdf|\\.doc/);
    }
  });

  test('accuracy page has proper heading structure', async ({ page }) => {
    // Check for H1
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();
    
    // Check for H2s
    const h2s = page.locator('h2').all();
    const h2Count = await (await h2s).length;
    expect(h2Count).toBeGreaterThan(0);
  });

  test('last updated timestamp is displayed', async ({ page }) => {
    // Check for last updated text
    const lastUpdated = page.locator('text=/Last updated|अंतिम अपडेट|Updated/i').first();
    await expect(lastUpdated).toBeVisible();
  });
});

test.describe('Accuracy Page Data Validation', () => {
  test('accuracy stats are within expected ranges', async ({ page }) => {
    await page.goto('/accuracy');
    await page.waitForLoadState('networkidle');
    
    // Get directional accuracy text
    const accuracyText = await page.locator('text=/96\\.2%|95%|Directional/i').first().textContent();
    expect(accuracyText).toBeTruthy();
    
    // Verify accuracy is in reasonable range (90-100%)
    const accuracyMatch = accuracyText?.match(/(\d+)%/);
    if (accuracyMatch) {
      const accuracyValue = parseInt(accuracyMatch[1]);
      expect(accuracyValue).toBeGreaterThanOrEqual(90);
      expect(accuracyValue).toBeLessThanOrEqual(100);
    }
  });

  test('MAPE is below target threshold', async ({ page }) => {
    await page.goto('/accuracy');
    await page.waitForLoadState('networkidle');
    
    // Get MAPE text
    const mapeText = await page.locator('text=/MAPE|4\\.8%/i').first().textContent();
    expect(mapeText).toBeTruthy();
    
    // Verify MAPE is below 6% target
    const mapeMatch = mapeText?.match(/(\d+\\.?\d*)%/);
    if (mapeMatch) {
      const mapeValue = parseFloat(mapeMatch[1]);
      expect(mapeValue).toBeLessThan(6);
    }
  });
});
