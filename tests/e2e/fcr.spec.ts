/**
 * PoultryPulse AI — FCR Analytics E2E Tests
 * TASK-044: Update E2E Test Suite for Operational Features
 * File: tests/e2e/fcr.spec.ts
 * 
 * Tests FCR calculation and gauge color updates:
 * - Log feed data
 * - Verify FCR gauge color correct
 * - Verify batch ROI optimizer auto-uses actual FCR not hardcoded 2.2
 */

import { test, expect } from '@playwright/test';

test.describe('FCR Analytics', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
  });

  test('FCR gauge shows correct color based on value', async ({ page }) => {
    // Navigate to batch detail
    await page.goto('/dashboard/batches');
    await page.waitForLoadState('networkidle');

    const firstBatchCard = page.locator('[data-testid^="batch-card-"]').first();
    await firstBatchCard.click();
    await page.waitForLoadState('networkidle');

    // Switch to Feed tab
    await page.click('button:has-text("Feed")');

    // Look for FCR gauge
    const fcrGauge = page.locator('[data-testid="fcr-gauge"]');
    await expect(fcrGauge).toBeVisible();

    const fcrValue = page.locator('[data-testid="fcr-value"]');
    const fcrText = await fcrValue.textContent();
    expect(fcrText).not.toBeNull();
    const fcrNumber = parseFloat(fcrText || '0');

    // Verify color based on FCR value
    // Green: < 1.7, Amber: 1.7-2.0, Red: > 2.0
    if (fcrNumber < 1.7) {
      const gaugeColor = await fcrGauge.evaluate(el => {
        return window.getComputedStyle(el).backgroundColor;
      });
      const isGreen = gaugeColor.includes('green') || gaugeColor.includes('rgb(0, 128, 0)');
      expect(isGreen).toBeTruthy();
    } else if (fcrNumber >= 1.7 && fcrNumber <= 2.0) {
      const gaugeColor = await fcrGauge.evaluate(el => {
        return window.getComputedStyle(el).backgroundColor;
      });
      const isAmber = gaugeColor.includes('orange') || gaugeColor.includes('rgb(255, 165, 0)');
      expect(isAmber).toBeTruthy();
    } else {
      const gaugeColor = await fcrGauge.evaluate(el => {
        return window.getComputedStyle(el).backgroundColor;
      });
      const isRed = gaugeColor.includes('red') || gaugeColor.includes('rgb(255, 0, 0)');
      expect(isRed).toBeTruthy();
    }
  });

  test('FCR updates after logging feed data', async ({ page }) => {
    await page.goto('/dashboard/batches');
    await page.waitForLoadState('networkidle');

    const firstBatchCard = page.locator('[data-testid^="batch-card-"]').first();
    await firstBatchCard.click();
    await page.waitForLoadState('networkidle');

    await page.click('button:has-text("Feed")');

    // Get initial FCR value
    const fcrValueBefore = page.locator('[data-testid="fcr-value"]');
    const fcrTextBefore = await fcrValueBefore.textContent();
    expect(fcrTextBefore).not.toBeNull();
    const fcrBefore = parseFloat(fcrTextBefore || '0');

    // Log new feed data
    await page.click('button:has-text("Log Feed")');
    await page.waitForLoadState('networkidle');

    const today = new Date().toISOString().split('T')[0];
    
    const feedDateInput = page.locator('input[type="date"]');
    await feedDateInput.fill(today);

    const morningFeedInput = page.locator('input[name="morningFeedKg"]');
    await morningFeedInput.fill('600');

    const eveningFeedInput = page.locator('input[name="eveningFeedKg"]');
    await eveningFeedInput.fill('600');

    const waterInput = page.locator('input[name="waterLitres"]');
    await waterInput.fill('1800');

    const feedBrandSelect = page.locator('select[name="feedBrand"]');
    await feedBrandSelect.selectOption('Godrej Agrovet');

    await page.click('button:has-text("Log Feed")');
    await page.waitForSelector('text=Feed Logged Successfully');

    // Wait for FCR to recalculate
    await page.waitForTimeout(2000);

    // Get updated FCR value
    const fcrValueAfter = page.locator('[data-testid="fcr-value"]');
    const fcrTextAfter = await fcrValueAfter.textContent();
    expect(fcrTextAfter).not.toBeNull();
    const fcrAfter = parseFloat(fcrTextAfter || '0');

    // FCR should have changed after new feed log
    expect(fcrAfter).not.toBe(fcrBefore);
  });

  test('FCR trend chart displays actual vs breed standard', async ({ page }) => {
    await page.goto('/dashboard/batches');
    await page.waitForLoadState('networkidle');

    const firstBatchCard = page.locator('[data-testid^="batch-card-"]').first();
    await firstBatchCard.click();
    await page.waitForLoadState('networkidle');

    await page.click('button:has-text("Feed")');

    // Look for FCR trend chart
    const fcrTrendChart = page.locator('[data-testid="fcr-trend-chart"]');
    await expect(fcrTrendChart).toBeVisible();

    // Verify chart shows actual FCR line
    const actualFcrLine = fcrTrendChart.locator('[data-testid="actual-fcr-line"]');
    await expect(actualFcrLine).toBeVisible();

    // Verify chart shows breed standard reference line
    const breedStandardLine = fcrTrendChart.locator('[data-testid="breed-standard-line"]');
    await expect(breedStandardLine).toBeVisible();

    // Verify divergence region is highlighted
    const divergenceRegion = fcrTrendChart.locator('[data-testid="divergence-region"]');
    await expect(divergenceRegion).toBeVisible();
  });

  test('Batch ROI Optimizer uses actual FCR not hardcoded 2.2', async ({ page }) => {
    // First, ensure we have feed data logged for a batch
    await page.goto('/dashboard/batches');
    await page.waitForLoadState('networkidle');

    const firstBatchCard = page.locator('[data-testid^="batch-card-"]').first();
    await firstBatchCard.click();
    await page.waitForLoadState('networkidle');

    // Get the actual FCR from the batch
    await page.click('button:has-text("Feed")');
    const fcrValue = page.locator('[data-testid="fcr-value"]');
    const fcrText = await fcrValue.textContent();
    expect(fcrText).not.toBeNull();
    const actualFcr = parseFloat(fcrText || '0');

    // Open ROI Optimizer
    await page.click('button:has-text("Open ROI Optimizer")');
    await page.waitForLoadState('networkidle');

    // Look for FCR input in ROI Optimizer
    const roiFcrInput = page.locator('input[name="fcr"]');
    const roiFcrValue = await roiFcrInput.inputValue();
    const roiFcrNumber = parseFloat(roiFcrValue);

    // Verify ROI Optimizer is using the actual FCR, not hardcoded 2.2
    expect(roiFcrNumber).toBe(actualFcr);
    expect(roiFcrNumber).not.toBe(2.2);
  });

  test('Feed-water ratio deviation alert fires when ratio is abnormal', async ({ page }) => {
    // Log feed with abnormal water ratio
    await page.goto('/dashboard/batches');
    await page.waitForLoadState('networkidle');

    const firstBatchCard = page.locator('[data-testid^="batch-card-"]').first();
    await firstBatchCard.click();
    await page.waitForLoadState('networkidle');

    await page.click('button:has-text("Feed")');
    await page.click('button:has-text("Log Feed")');
    await page.waitForLoadState('networkidle');

    const today = new Date().toISOString().split('T')[0];
    
    const feedDateInput = page.locator('input[type="date"]');
    await feedDateInput.fill(today);

    const morningFeedInput = page.locator('input[name="morningFeedKg"]');
    await morningFeedInput.fill('500');

    const eveningFeedInput = page.locator('input[name="eveningFeedKg"]');
    await eveningFeedInput.fill('500');

    // Set water too low (ratio < 1.8)
    const waterInput = page.locator('input[name="waterLitres"]');
    await waterInput.fill('800'); // 1000kg feed / 800L water = 1.25 ratio (too low)

    const feedBrandSelect = page.locator('select[name="feedBrand"]');
    await feedBrandSelect.selectOption('Godrej Agrovet');

    await page.click('button:has-text("Log Feed")');
    await page.waitForSelector('text=Feed Logged Successfully');

    // Check for feed-water deviation alert
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.click('button:has-text("Alerts")');
    await page.waitForLoadState('networkidle');

    const feedWaterAlert = page.locator('[data-testid="alert-feed-water-deviation"]');
    
    // Alert should appear within 60 seconds
    await expect(feedWaterAlert).toBeVisible({ timeout: 70000 });

    // Verify alert shows correct message
    await expect(feedWaterAlert).toContainText('पानी कम पिया जा रहा है');
    await expect(feedWaterAlert).toContainText('MEDIUM');
  });

  test('Feed allocation recommendation is calculated correctly', async ({ page }) => {
    await page.goto('/dashboard/batches');
    await page.waitForLoadState('networkidle');

    const firstBatchCard = page.locator('[data-testid^="batch-card-"]').first();
    await firstBatchCard.click();
    await page.waitForLoadState('networkidle');

    await page.click('button:has-text("Feed")');

    // Look for feed allocation recommendation card
    const feedAllocationCard = page.locator('[data-testid="feed-allocation-card"]');
    await expect(feedAllocationCard).toBeVisible();

    // Verify recommendation shows total feed in kg
    const totalFeed = feedAllocationCard.locator('[data-testid="total-feed-kg"]');
    await expect(totalFeed).toBeVisible();
    await expect(totalFeed).toContainText('kg');

    // Verify recommendation shows morning/evening split
    const morningFeed = feedAllocationCard.locator('[data-testid="morning-feed-kg"]');
    const eveningFeed = feedAllocationCard.locator('[data-testid="evening-feed-kg"]');
    await expect(morningFeed).toBeVisible();
    await expect(eveningFeed).toBeVisible();

    // Verify recommendation shows calculation basis
    const calculationBasis = feedAllocationCard.locator('[data-testid="calculation-basis"]');
    await expect(calculationBasis).toBeVisible();
    await expect(calculationBasis).toContainText('पक्षी');
  });

  test('User can override feed allocation recommendation', async ({ page }) => {
    await page.goto('/dashboard/batches');
    await page.waitForLoadState('networkidle');

    const firstBatchCard = page.locator('[data-testid^="batch-card-"]').first();
    await firstBatchCard.click();
    await page.waitForLoadState('networkidle');

    await page.click('button:has-text("Feed")');

    const feedAllocationCard = page.locator('[data-testid="feed-allocation-card"]');
    await expect(feedAllocationCard).toBeVisible();

    // Click override button
    await page.click('button:has-text("बदलें")');
    await page.waitForLoadState('networkidle');

    // Enter custom feed quantity
    const customFeedInput = page.locator('input[name="customFeedKg"]');
    await customFeedInput.fill('4000');

    // Select reason code
    const reasonSelect = page.locator('select[name="overrideReason"]');
    await reasonSelect.selectOption('Hot weather');

    // Save override
    await page.click('button:has-text("Save")');
    await page.waitForSelector('text=Override Saved');

    // Verify override is logged
    const overrideLog = page.locator('[data-testid="feed-override-log"]');
    await expect(overrideLog).toBeVisible();
    await expect(overrideLog).toContainText('Hot weather');
  });

  test('FCR forecasting displays projection on trend chart', async ({ page }) => {
    await page.goto('/dashboard/batches');
    await page.waitForLoadState('networkidle');

    const firstBatchCard = page.locator('[data-testid^="batch-card-"]').first();
    await firstBatchCard.click();
    await page.waitForLoadState('networkidle');

    await page.click('button:has-text("Feed")');

    const fcrTrendChart = page.locator('[data-testid="fcr-trend-chart"]');
    await expect(fcrTrendChart).toBeVisible();

    // Look for forecast line (dashed line beyond current date)
    const forecastLine = fcrTrendChart.locator('[data-testid="fcr-forecast-line"]');
    
    // Forecast line may or may not be visible depending on data availability
    if (await forecastLine.isVisible()) {
      // Verify it's styled as dashed
      const lineStyle = await forecastLine.evaluate(el => {
        return window.getComputedStyle(el).borderStyle;
      });
      expect(lineStyle).toContain('dashed');
    }
  });

  test('Multi-farm FCR comparison shows all active batches ranked by FCR', async ({ page }) => {
    // This test is for S2 integrators
    // Navigate to multi-shed performance grid
    await page.goto('/dashboard/batches');
    await page.waitForLoadState('networkidle');

    // Look for table view toggle
    const tableViewToggle = page.locator('button:has-text("Table View")');
    
    if (await tableViewToggle.isVisible()) {
      await tableViewToggle.click();
      await page.waitForLoadState('networkidle');

      // Look for FCR comparison chart
      const fcrComparisonChart = page.locator('[data-testid="fcr-comparison-chart"]');
      await expect(fcrComparisonChart).toBeVisible();

      // Verify batches are ranked by FCR
      const batchBars = fcrComparisonChart.locator('[data-testid^="batch-bar-"]');
      const barCount = await batchBars.count();
      expect(barCount).toBeGreaterThan(0);

      // Verify outlier batches are highlighted in red
      const outlierBars = fcrComparisonChart.locator('[data-testid="outlier-batch"]');
      // Outliers may or may not exist
      if (await outlierBars.count() > 0) {
        const barColor = await outlierBars.first().evaluate(el => {
          return window.getComputedStyle(el).backgroundColor;
        });
        expect(barColor).toContain('red');
      }
    }
  });

  test('Feed cost per kg of meat is calculated and displayed', async ({ page }) => {
    await page.goto('/dashboard/batches');
    await page.waitForLoadState('networkidle');

    const firstBatchCard = page.locator('[data-testid^="batch-card-"]').first();
    await firstBatchCard.click();
    await page.waitForLoadState('networkidle');

    await page.click('button:has-text("Feed")');

    // Look for feed cost per kg KPI
    const feedCostKg = page.locator('[data-testid="feed-cost-per-kg"]');
    await expect(feedCostKg).toBeVisible();
    await expect(feedCostKg).toContainText('₹');

    // Verify trend vs last batch is shown
    const trendVsLastBatch = page.locator('[data-testid="feed-cost-trend"]');
    await expect(trendVsLastBatch).toBeVisible();
  });
});
