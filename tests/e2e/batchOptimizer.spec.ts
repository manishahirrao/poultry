/**
 * PoultryPulse AI — Batch Optimizer E2E Tests
 * TASK-027: End-to-End Test Suite
 * File: tests/e2e/batchOptimizer.spec.ts
 */

import { test, expect } from '@playwright/test';

test.describe('Batch Optimizer', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to calculator page
    await page.goto('/dashboard/calculator');
    await page.waitForLoadState('networkidle');
  });

  test('Input change updates ROI within 50ms', async ({ page }) => {
    // Get initial ROI value
    const initialROI = await page.locator('[data-testid="roi-value"]').textContent();

    // Change bird count input
    const birdCountInput = page.locator('[data-testid="bird-count-input"]');
    await birdCountInput.fill('15000');

    // Measure time for ROI update
    const startTime = Date.now();
    await page.waitForSelector('[data-testid="roi-value"]:not(:empty)', { timeout: 1000 });
    const endTime = Date.now();
    const updateLatency = endTime - startTime;

    // Verify update happened within 50ms
    expect(updateLatency).toBeLessThan(50);

    // Verify ROI value changed
    const newROI = await page.locator('[data-testid="roi-value"]').textContent();
    expect(newROI).not.toBe(initialROI);
  });

  test('Optimal row highlighted correctly', async ({ page }) => {
    // Navigate to batch optimizer section
    await page.goto('/dashboard/calculator');
    await page.waitForLoadState('networkidle');

    // Check for optimal row highlight
    const optimalRow = page.locator('[data-testid="optimal-row"]');
    await expect(optimalRow).toBeVisible();
    await expect(optimalRow).toHaveClass(/bg-green/);
  });

  test('Break-even warning shows for low price input', async ({ page }) => {
    // Set low target price (below cost)
    const targetPriceInput = page.locator('[data-testid="target-price-input"]');
    await targetPriceInput.fill('80'); // Very low price

    // Check for break-even warning
    const breakEvenWarning = page.locator('[data-testid="break-even-warning"]');
    await expect(breakEvenWarning).toBeVisible();
    await expect(breakEvenWarning).toContainText('break-even');
  });

  test('All calculator inputs are validated', async ({ page }) => {
    // Test negative bird count
    const birdCountInput = page.locator('[data-testid="bird-count-input"]');
    await birdCountInput.fill('-100');
    
    // Should show validation error
    const validationError = page.locator('[data-testid="validation-error"]');
    await expect(validationError).toBeVisible();
  });

  test('Calculator persists data across navigation', async ({ page }) => {
    // Enter batch data
    const birdCountInput = page.locator('[data-testid="bird-count-input"]');
    await birdCountInput.fill('12000');

    // Navigate away and back
    await page.goto('/dashboard/overview');
    await page.waitForLoadState('networkidle');
    await page.goto('/dashboard/calculator');
    await page.waitForLoadState('networkidle');

    // Verify data persisted
    const persistedValue = await birdCountInput.inputValue();
    expect(persistedValue).toBe('12000');
  });

  test('Export to CSV functionality works', async ({ page }) => {
    // Fill calculator with valid data
    const birdCountInput = page.locator('[data-testid="bird-count-input"]');
    await birdCountInput.fill('10000');

    // Click export button
    const exportButton = page.locator('[data-testid="export-csv-button"]');
    await exportButton.click();

    // Verify download started
    const downloadPromise = page.waitForEvent('download');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/batch.*\.csv$/);
  });
});
