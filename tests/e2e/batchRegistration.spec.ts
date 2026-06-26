/**
 * PoultryPulse AI — Batch Registration E2E Tests
 * TASK-030: Batch Registration Form & DOC Supplier Registry
 * File: tests/e2e/batchRegistration.spec.ts
 */

import { test, expect } from '@playwright/test';

test.describe('Batch Registration', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
  });

  test('Register batch and verify it appears in Batch Status Board', async ({ page }) => {
    // Navigate to batch registration page
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

    // Navigate to Batch Status Board
    await page.goto('/dashboard/batches');
    await page.waitForLoadState('networkidle');

    // Verify the batch appears in "Placement" column
    const placementColumn = page.locator('[data-testid="placement-column"]');
    await expect(placementColumn).toBeVisible();

    // Verify the batch ID format (e.g., GKP-202606-001)
    const batchId = page.locator('[data-testid="batch-id"]');
    await expect(batchId).toBeVisible();
    const batchIdText = await batchId.textContent();
    expect(batchIdText).toMatch(/^[A-Z]{3}-\d{6}-\d{3}$/);
  });

  test('Breed selection auto-populates target harvest weight', async ({ page }) => {
    await page.goto('/dashboard/batches/new');
    await page.waitForLoadState('networkidle');

    const breedSelect = page.locator('select[name="breed"]');
    const targetWeightInput = page.locator('input[name="targetHarvestWeightKg"]');

    // Select Cobb 500
    await breedSelect.selectOption('Cobb 500');
    await expect(targetWeightInput).toHaveValue('2.2');

    // Select Ross 308
    await breedSelect.selectOption('Ross 308');
    await expect(targetWeightInput).toHaveValue('2.3');

    // Select Vencobb
    await breedSelect.selectOption('Vencobb');
    await expect(targetWeightInput).toHaveValue('2.0');

    // Select Hubbard
    await breedSelect.selectOption('Hubbard');
    await expect(targetWeightInput).toHaveValue('2.1');
  });

  test('DOC supplier autocomplete shows saved suppliers', async ({ page }) => {
    await page.goto('/dashboard/batches/new');
    await page.waitForLoadState('networkidle');

    const docSupplierInput = page.locator('input[name="docSupplier"]');
    
    // Type in supplier name
    await docSupplierInput.fill('Test');

    // Wait for autocomplete suggestions
    const suggestions = page.locator('[data-testid="supplier-suggestions"]');
    await expect(suggestions).toBeVisible();

    // Verify supplier rating is shown
    const supplierRating = page.locator('[data-testid="supplier-rating"]');
    await expect(supplierRating).toBeVisible();
    await expect(supplierRating).toContainText('⭐');
  });

  test('Form validation prevents invalid submissions', async ({ page }) => {
    await page.goto('/dashboard/batches/new');
    await page.waitForLoadState('networkidle');

    // Try to submit without required fields
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Verify validation errors
    const validationError = page.locator('[data-testid="validation-error"]');
    await expect(validationError).toBeVisible();

    // Test invalid DOC count
    const docCountInput = page.locator('input[name="docCount"]');
    await docCountInput.fill('500'); // Below minimum
    await submitButton.click();
    await expect(validationError).toContainText('1,000');

    // Test invalid DOC count (above maximum)
    await docCountInput.fill('150000'); // Above maximum
    await submitButton.click();
    await expect(validationError).toContainText('100,000');
  });

  test('Success toast navigates to Batch Detail Drawer', async ({ page }) => {
    await page.goto('/dashboard/batches/new');
    await page.waitForLoadState('networkidle');

    // Fill and submit form
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

    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Wait for success toast and navigation
    const successToast = page.locator('[data-testid="toast-success"]');
    await expect(successToast).toBeVisible();

    // Verify navigation to batch detail drawer
    await page.waitForURL(/\/dashboard\/batches\/[A-Z]{3}-\d{6}-\d{3}$/);
    const batchDetailDrawer = page.locator('[data-testid="batch-detail-drawer"]');
    await expect(batchDetailDrawer).toBeVisible();
  });

  test('Cancel button resets form', async ({ page }) => {
    await page.goto('/dashboard/batches/new');
    await page.waitForLoadState('networkidle');

    // Fill some fields
    const docCountInput = page.locator('input[name="docCount"]');
    await docCountInput.fill('25000');

    const docSupplierInput = page.locator('input[name="docSupplier"]');
    await docSupplierInput.fill('Test Supplier');

    // Click cancel button
    const cancelButton = page.locator('button:has-text("Cancel")');
    await cancelButton.click();

    // Verify form is reset or navigated away
    const docCountValue = await docCountInput.inputValue();
    expect(docCountValue).toBe('');
  });
});
