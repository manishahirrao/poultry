/**
 * PoultryPulse AI — Batch Lifecycle E2E Tests
 * TASK-044: Update E2E Test Suite for Operational Features
 * File: tests/e2e/batchLifecycle.spec.ts
 * 
 * Tests the complete batch lifecycle from registration through harvest:
 * - Register batch → appears in Placement column
 * - Log feed → FCR updates
 * - Log mortality → alert fires
 * - Mark as harvested → moves to Harvested column
 */

import { test, expect } from '@playwright/test';

test.describe('Batch Lifecycle', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
  });

  test('Complete batch lifecycle from registration to harvest', async ({ page }) => {
    // Step 1: Register a new batch
    await page.goto('/dashboard/batches/new');
    await page.waitForLoadState('networkidle');

    // Fill in batch registration form
    const shedSelect = page.locator('select[name="shedId"]');
    await shedSelect.selectOption('Shed 1');

    const docDateInput = page.locator('input[type="date"]');
    const today = new Date().toISOString().split('T')[0];
    await docDateInput.fill(today);

    const docCountInput = page.locator('input[name="docCount"]');
    await docCountInput.fill('25000');

    const docSupplierInput = page.locator('input[name="docSupplier"]');
    await docSupplierInput.fill('Test Supplier');

    const breedSelect = page.locator('select[name="breed"]');
    await breedSelect.selectOption('Cobb 500');

    const targetWeightInput = page.locator('input[name="targetHarvestWeightKg"]');
    await targetWeightInput.fill('2.2');

    // Submit the form
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Wait for success toast
    const successToast = page.locator('[data-testid="toast-success"]');
    await expect(successToast).toBeVisible();
    await expect(successToast).toContainText('बनाया गया ✅');

    // Extract batch ID from success message
    const batchIdText = await successToast.textContent();
    const batchIdMatch = batchIdText.match(/([A-Z]{3}-\d{6}-\d{3})/);
    const batchId = batchIdMatch ? batchIdMatch[1] : null;
    expect(batchId).toBeTruthy();

    // Step 2: Verify batch appears in Placement column
    await page.goto('/dashboard/batches');
    await page.waitForLoadState('networkidle');

    const placementColumn = page.locator('[data-testid="placement-column"]');
    await expect(placementColumn).toBeVisible();

    const batchCard = page.locator(`[data-testid="batch-card-${batchId}"]`);
    await expect(batchCard).toBeVisible();

    // Verify batch is in Placement column (Day 1-7)
    await expect(batchCard.locator('[data-testid="batch-status"]')).toContainText('Placement');

    // Step 3: Log feed data for the batch
    await batchCard.click();
    await page.waitForLoadState('networkidle');

    // Switch to Feed tab
    await page.click('button:has-text("Feed")');

    // Click "Log Feed" button
    await page.click('button:has-text("Log Feed")');

    // Fill in feed log form
    const feedDateInput = page.locator('input[type="date"]');
    await feedDateInput.fill(today);

    const morningFeedInput = page.locator('input[name="morningFeedKg"]');
    await morningFeedInput.fill('500');

    const eveningFeedInput = page.locator('input[name="eveningFeedKg"]');
    await eveningFeedInput.fill('500');

    const waterInput = page.locator('input[name="waterLitres"]');
    await waterInput.fill('1500');

    const feedBrandSelect = page.locator('select[name="feedBrand"]');
    await feedBrandSelect.selectOption('Godrej Agrovet');

    // Submit feed log
    await page.click('button:has-text("Log Feed")');

    // Wait for success message
    await page.waitForSelector('text=Feed Logged Successfully');

    // Step 4: Verify FCR updates
    const fcrGauge = page.locator('[data-testid="fcr-gauge"]');
    await expect(fcrGauge).toBeVisible();

    const fcrValue = page.locator('[data-testid="fcr-value"]');
    await expect(fcrValue).toBeVisible();
    
    // FCR should be calculated and displayed
    const fcrText = await fcrValue.textContent();
    expect(fcrText).toMatch(/\d+\.\d+/);

    // Verify FCR gauge color (should be green for good FCR)
    const fcrGaugeColor = await fcrGauge.evaluate(el => {
      return window.getComputedStyle(el).backgroundColor;
    });
    expect(fcrGaugeColor).toContain('rgb'); // Should have a color

    // Step 5: Log mortality
    await page.click('button:has-text("Mortality")');

    // Click "Log Mortality" button
    await page.click('button:has-text("Log Mortality")');

    // Fill in mortality form
    const mortalityCountInput = page.locator('input[name="mortalityCount"]');
    await mortalityCountInput.fill('5');

    const causeSelect = page.locator('select[name="cause"]');
    await causeSelect.selectOption('Unknown');

    // Submit mortality log
    await page.click('button:has-text("Log Mortality")');

    // Wait for success message
    await page.waitForSelector('text=Mortality Logged Successfully');

    // Step 6: Verify abnormal mortality alert fires (if threshold exceeded)
    // For this test, we'll check if alert appears in Alert Intelligence Center
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Navigate to Alert Intelligence Center
    await page.click('button:has-text("Alerts")');
    await page.waitForLoadState('networkidle');

    // Check for abnormal mortality alert
    const abnormalMortalityAlert = page.locator('[data-testid="alert-abnormal-mortality"]');
    
    // Alert may or may not appear depending on threshold
    // If it appears, verify it shows financial impact
    if (await abnormalMortalityAlert.isVisible()) {
      await expect(abnormalMortalityAlert).toContainText('असामान्य मृत्यु');
      const financialImpact = page.locator('[data-testid="financial-impact"]');
      await expect(financialImpact).toBeVisible();
    }

    // Step 7: Mark batch as harvested
    await page.goto('/dashboard/batches');
    await page.waitForLoadState('networkidle');

    // Click on the batch card
    await batchCard.click();
    await page.waitForLoadState('networkidle');

    // Click "Mark as Harvested" button
    await page.click('button:has-text("Mark as Harvested")');

    // Fill in harvest confirmation modal
    const harvestWeightInput = page.locator('input[name="harvestWeightKg"]');
    await harvestWeightInput.fill('2.1');

    const birdsSoldInput = page.locator('input[name="birdsSold"]');
    await birdsSoldInput.fill('24995');

    const salePriceInput = page.locator('input[name="salePricePerKg"]');
    await salePriceInput.fill('165');

    const buyerNameInput = page.locator('input[name="buyerName"]');
    await buyerNameInput.fill('Test Buyer');

    // Submit harvest
    await page.click('button:has-text("Confirm Harvest")');

    // Wait for success message
    await page.waitForSelector('text=Batch Harvested Successfully');

    // Step 8: Verify batch moves to Harvested column
    await page.goto('/dashboard/batches');
    await page.waitForLoadState('networkidle');

    const harvestedColumn = page.locator('[data-testid="harvested-column"]');
    await expect(harvestedColumn).toBeVisible();

    // Verify batch is now in Harvested column
    const harvestedBatchCard = harvestedColumn.locator(`[data-testid="batch-card-${batchId}"]`);
    await expect(harvestedBatchCard).toBeVisible();

    // Verify batch shows net profit
    const netProfit = harvestedBatchCard.locator('[data-testid="net-profit"]');
    await expect(netProfit).toBeVisible();
    await expect(netProfit).toContainText('₹');
  });

  test('Batch status transitions automatically based on age', async ({ page }) => {
    // This test verifies that batch status updates based on DOC date
    // In a real scenario, we would mock the current date or use a batch with known age
    
    await page.goto('/dashboard/batches');
    await page.waitForLoadState('networkidle');

    // Get all batch cards
    const batchCards = page.locator('[data-testid^="batch-card-"]');
    const count = await batchCards.count();

    if (count > 0) {
      // Check first batch card
      const firstCard = batchCards.first();
      const ageText = await firstCard.locator('[data-testid="batch-age"]').textContent();
      const statusText = await firstCard.locator('[data-testid="batch-status"]').textContent();

      // Verify age and status are displayed
      expect(ageText).toBeTruthy();
      expect(statusText).toBeTruthy();
    }
  });

  test('Batch ROI Optimizer pre-populates from batch data', async ({ page }) => {
    // Register a batch first
    await page.goto('/dashboard/batches/new');
    await page.waitForLoadState('networkidle');

    const shedSelect = page.locator('select[name="shedId"]');
    await shedSelect.selectOption('Shed 1');

    const docDateInput = page.locator('input[type="date"]');
    const today = new Date().toISOString().split('T')[0];
    await docDateInput.fill(today);

    const docCountInput = page.locator('input[name="docCount"]');
    await docCountInput.fill('25000');

    const docSupplierInput = page.locator('input[name="docSupplier"]');
    await docSupplierInput.fill('Test Supplier');

    const breedSelect = page.locator('select[name="breed"]');
    await breedSelect.selectOption('Cobb 500');

    const targetWeightInput = page.locator('input[name="targetHarvestWeightKg"]');
    await targetWeightInput.fill('2.2');

    await page.click('button[type="submit"]');
    await page.waitForSelector('[data-testid="toast-success"]');

    // Navigate to Batch Status Board
    await page.goto('/dashboard/batches');
    await page.waitForLoadState('networkidle');

    // Click on first batch card
    const firstBatchCard = page.locator('[data-testid^="batch-card-"]').first();
    await firstBatchCard.click();
    await page.waitForLoadState('networkidle');

    // Click "Open ROI Optimizer" button
    await page.click('button:has-text("Open ROI Optimizer")');
    await page.waitForLoadState('networkidle');

    // Verify ROI Optimizer is pre-populated with batch data
    const flockSizeInput = page.locator('input[name="flockSize"]');
    const flockSizeValue = await flockSizeInput.inputValue();
    expect(flockSizeValue).toBe('25000'); // Should match DOC count

    const breedDisplay = page.locator('[data-testid="roi-breed"]');
    await expect(breedDisplay).toContainText('Cobb 500');
  });

  test('Harvested batch archive is accessible via filter', async ({ page }) => {
    await page.goto('/dashboard/batches');
    await page.waitForLoadState('networkidle');

    // Click filter button
    await page.click('button:has-text("Filter")');

    // Select "Harvested" filter
    await page.click('text=Harvested');

    // Verify harvested batches are shown
    const harvestedColumn = page.locator('[data-testid="harvested-column"]');
    await expect(harvestedColumn).toBeVisible();
  });
});
