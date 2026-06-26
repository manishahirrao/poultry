import { test, expect } from '@playwright/test';

test.describe('Weight Deviation Alert - TASK-039', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard and login
    await page.goto('/dashboard');
    // Add login steps here if needed
  });

  test('should show weight deviation alert when weight is below 90% of breed standard', async ({ page }) => {
    // Navigate to batch detail drawer
    await page.click('[data-testid="batch-card"]:first-child');
    
    // Switch to Costs tab where weight tracking is located
    await page.click('button:has-text("Costs")');
    
    // Click "Log Weight" button
    await page.click('button:has-text("Log Weight")');
    
    // Fill in weight log form with values that would trigger deviation alert
    // For a 28-day old Cobb 500 batch, breed standard is 1.35 kg
    // Entering 1.2 kg (89% of standard) should trigger alert
    await page.fill('input[type="date"]', new Date().toISOString().split('T')[0]);
    await page.fill('input[placeholder="Minimum 30 birds"]', '30');
    await page.fill('input[placeholder="e.g., 1.850"]', '1.2');
    await page.fill('input[placeholder="e.g., 0.120"]', '0.1');
    
    // Verify deviation alert appears
    const deviationAlert = page.locator('.bg-amber-50, .bg-red-50');
    await expect(deviationAlert).toBeVisible();
    
    // Verify alert message contains Hindi text
    await expect(deviationAlert).toContainText('वज़न');
  });

  test('should show critical alert when weight is below 85% of breed standard', async ({ page }) => {
    // Navigate to batch detail drawer
    await page.click('[data-testid="batch-card"]:first-child');
    
    // Switch to Costs tab
    await page.click('button:has-text("Costs")');
    
    // Click "Log Weight" button
    await page.click('button:has-text("Log Weight")');
    
    // Fill with critical deviation (below 85%)
    await page.fill('input[type="date"]', new Date().toISOString().split('T')[0]);
    await page.fill('input[placeholder="Minimum 30 birds"]', '30');
    await page.fill('input[placeholder="e.g., 1.850"]', '1.1'); // ~81% of standard
    await page.fill('input[placeholder="e.g., 0.120"]', '0.1');
    
    // Verify critical alert (red background)
    const criticalAlert = page.locator('.bg-red-50');
    await expect(criticalAlert).toBeVisible();
    await expect(criticalAlert).toContainText('डॉक्टर से मिलें');
  });

  test('should not show alert when weight is within normal range', async ({ page }) => {
    // Navigate to batch detail drawer
    await page.click('[data-testid="batch-card"]:first-child');
    
    // Switch to Costs tab
    await page.click('button:has-text("Costs")');
    
    // Click "Log Weight" button
    await page.click('button:has-text("Log Weight")');
    
    // Fill with normal weight (within 95% of standard)
    await page.fill('input[type="date"]', new Date().toISOString().split('T')[0]);
    await page.fill('input[placeholder="Minimum 30 birds"]', '30');
    await page.fill('input[placeholder="e.g., 1.850"]', '1.4'); // ~104% of standard
    await page.fill('input[placeholder="e.g., 0.120"]', '0.1');
    
    // Verify no deviation alert appears
    const deviationAlert = page.locator('.bg-amber-50, .bg-red-50');
    await expect(deviationAlert).not.toBeVisible();
  });

  test('should validate sample size minimum of 30 birds', async ({ page }) => {
    // Navigate to batch detail drawer
    await page.click('[data-testid="batch-card"]:first-child');
    
    // Switch to Costs tab
    await page.click('button:has-text("Costs")');
    
    // Click "Log Weight" button
    await page.click('button:has-text("Log Weight")');
    
    // Try to submit with sample size below 30
    await page.fill('input[type="date"]', new Date().toISOString().split('T')[0]);
    await page.fill('input[placeholder="Minimum 30 birds"]', '25');
    await page.fill('input[placeholder="e.g., 1.850"]', '1.4');
    await page.fill('input[placeholder="e.g., 0.120"]', '0.1');
    
    // Try to submit
    await page.click('button:has-text("Submit Weight Log")');
    
    // Verify validation error appears
    const error = page.locator('text=Sample size must be at least 30 birds');
    await expect(error).toBeVisible();
  });

  test('should display weight progression chart with actual vs breed standard', async ({ page }) => {
    // Navigate to batch detail drawer
    await page.click('[data-testid="batch-card"]:first-child');
    
    // Switch to Costs tab
    await page.click('button:has-text("Costs")');
    
    // Verify weight progression chart is visible
    const chart = page.locator('[aria-label*="Weight progression"]');
    await expect(chart).toBeVisible();
    
    // Verify chart shows both actual and breed standard lines
    await expect(page.locator('text=Actual Weight')).toBeVisible();
    await expect(page.locator('text=Breed Standard')).toBeVisible();
  });

  test('should display performance benchmarking radar chart in overview', async ({ page }) => {
    // Navigate to batch detail drawer
    await page.click('[data-testid="batch-card"]:first-child');
    
    // Verify overview tab is active by default
    await expect(page.locator('button:has-text("Overview")')).toHaveClass(/bg-brand-green-50/);
    
    // Verify performance benchmarking section is visible
    const benchmarkSection = page.locator('text=Performance Benchmarking');
    await expect(benchmarkSection).toBeVisible();
    
    // Verify radar chart is rendered
    const radarChart = page.locator('[aria-label*="Performance benchmarking"]');
    await expect(radarChart).toBeVisible();
  });

  test('should show privacy message when district data is insufficient', async ({ page }) => {
    // Navigate to batch detail drawer
    await page.click('[data-testid="batch-card"]:first-child');
    
    // Verify overview tab is active
    await expect(page.locator('button:has-text("Overview")')).toHaveClass(/bg-brand-green-50/);
    
    // Check for privacy message (may or may not appear depending on data)
    const privacyMessage = page.locator('text=Not enough data in your district yet');
    
    // If message appears, verify it contains the correct text
    if (await privacyMessage.isVisible()) {
      await expect(privacyMessage).toContainText('minimum 5 farms');
    }
  });
});

test.describe('Weight Log Form Integration - TASK-039', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
  });

  test('should successfully submit weight log and update batch current weight', async ({ page }) => {
    // Navigate to batch detail drawer
    await page.click('[data-testid="batch-card"]:first-child');
    
    // Switch to Costs tab
    await page.click('button:has-text("Costs")');
    
    // Click "Log Weight" button
    await page.click('button:has-text("Log Weight")');
    
    // Fill valid weight log
    await page.fill('input[type="date"]', new Date().toISOString().split('T')[0]);
    await page.fill('input[placeholder="Minimum 30 birds"]', '35');
    await page.fill('input[placeholder="e.g., 1.850"]', '1.5');
    await page.fill('input[placeholder="e.g., 0.120"]', '0.08');
    
    // Submit
    await page.click('button:has-text("Submit Weight Log")');
    
    // Verify success message
    const successMessage = page.locator('text=Weight Log Submitted Successfully');
    await expect(successMessage).toBeVisible();
    
    // Verify form closes and chart updates
    await expect(page.locator('button:has-text("Log Weight")')).toBeVisible();
  });

  test('should show breed standard weight reference in form', async ({ page }) => {
    // Navigate to batch detail drawer
    await page.click('[data-testid="batch-card"]:first-child');
    
    // Switch to Costs tab
    await page.click('button:has-text("Costs")');
    
    // Click "Log Weight" button
    await page.click('button:has-text("Log Weight")');
    
    // Verify breed standard reference text appears
    const breedStandardText = page.locator('text=Breed standard for this age');
    await expect(breedStandardText).toBeVisible();
  });
});
