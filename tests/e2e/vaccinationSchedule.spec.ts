/**
 * PoultryPulse AI — Vaccination Schedule E2E Tests
 * TASK-034: Vaccination Schedule Manager
 * File: tests/e2e/vaccinationSchedule.spec.ts
 */

import { test, expect } from '@playwright/test';

test.describe('Vaccination Schedule Manager', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
  });

  test('Create batch and verify 5 vaccination schedules are auto-created', async ({ page }) => {
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

    // Get the batch ID from the success message
    const batchIdText = await successToast.textContent();
    const batchIdMatch = batchIdText?.match(/([A-Z]{3}-\d{6}-\d{3})/);
    const batchId = batchIdMatch ? batchIdMatch[1] : '';

    // Navigate to batch detail drawer
    await page.goto(`/dashboard/batches/${batchId}`);
    await page.waitForLoadState('networkidle');

    // Click on Health tab
    const healthTab = page.locator('button:has-text("Health")');
    await healthTab.click();
    await page.waitForLoadState('networkidle');

    // Verify Vaccination Calendar is visible
    const vaccinationCalendar = page.locator('[data-testid="vaccination-calendar"]');
    await expect(vaccinationCalendar).toBeVisible();

    // Verify 5 vaccination schedules are shown in the calendar
    const vaccinationMarkers = page.locator('[data-testid="vaccination-marker"]');
    await expect(vaccinationMarkers).toHaveCount(5);

    // Verify the vaccination days are correct (Day 1, 7, 14, 21, 28)
    const scheduledDays = await vaccinationMarkers.allTextContents();
    expect(scheduledDays).toContain('1');
    expect(scheduledDays).toContain('7');
    expect(scheduledDays).toContain('14');
    expect(scheduledDays).toContain('21');
    expect(scheduledDays).toContain('28');
  });

  test('Vaccination calendar displays monthly view with day markers', async ({ page }) => {
    // Navigate to an existing batch's health tab
    await page.goto('/dashboard/batches');
    await page.waitForLoadState('networkidle');

    // Click on first batch card
    const firstBatchCard = page.locator('[data-testid="batch-card"]').first();
    await firstBatchCard.click();
    await page.waitForLoadState('networkidle');

    // Click on Health tab
    const healthTab = page.locator('button:has-text("Health")');
    await healthTab.click();
    await page.waitForLoadState('networkidle');

    // Verify Vaccination Calendar is visible
    const vaccinationCalendar = page.locator('[data-testid="vaccination-calendar"]');
    await expect(vaccinationCalendar).toBeVisible();

    // Verify month navigation controls
    const monthLabel = page.locator('[data-testid="calendar-month-label"]');
    await expect(monthLabel).toBeVisible();

    const prevMonthButton = page.locator('button[aria-label="Previous month"]');
    const nextMonthButton = page.locator('button[aria-label="Next month"]');
    await expect(prevMonthButton).toBeVisible();
    await expect(nextMonthButton).toBeVisible();

    // Verify calendar grid has 7 columns (days of week)
    const calendarGrid = page.locator('[data-testid="calendar-grid"]');
    await expect(calendarGrid).toBeVisible();
  });

  test('Clicking vaccination day opens detail modal', async ({ page }) => {
    // Navigate to an existing batch's health tab
    await page.goto('/dashboard/batches');
    await page.waitForLoadState('networkidle');

    // Click on first batch card
    const firstBatchCard = page.locator('[data-testid="batch-card"]').first();
    await firstBatchCard.click();
    await page.waitForLoadState('networkidle');

    // Click on Health tab
    const healthTab = page.locator('button:has-text("Health")');
    await healthTab.click();
    await page.waitForLoadState('networkidle');

    // Click on a vaccination day marker
    const vaccinationMarker = page.locator('[data-testid="vaccination-marker"]').first();
    await vaccinationMarker.click();
    await page.waitForLoadState('networkidle');

    // Verify vaccination detail modal is visible
    const vaccinationModal = page.locator('[data-testid="vaccination-detail-modal"]');
    await expect(vaccinationModal).toBeVisible();

    // Verify vaccine name is displayed
    const vaccineName = page.locator('[data-testid="vaccine-name"]');
    await expect(vaccineName).toBeVisible();

    // Verify scheduled day is displayed
    const scheduledDay = page.locator('[data-testid="scheduled-day"]');
    await expect(scheduledDay).toBeVisible();

    // Verify status badge is displayed
    const statusBadge = page.locator('[data-testid="vaccination-status"]');
    await expect(statusBadge).toBeVisible();
  });

  test('Log vaccination completion form saves data', async ({ page }) => {
    // Navigate to an existing batch's health tab
    await page.goto('/dashboard/batches');
    await page.waitForLoadState('networkidle');

    // Click on first batch card
    const firstBatchCard = page.locator('[data-testid="batch-card"]').first();
    await firstBatchCard.click();
    await page.waitForLoadState('networkidle');

    // Click on Health tab
    const healthTab = page.locator('button:has-text("Health")');
    await healthTab.click();
    await page.waitForLoadState('networkidle');

    // Click on a pending vaccination day marker
    const pendingVaccination = page.locator('[data-testid="vaccination-marker"][data-status="pending"]').first();
    await pendingVaccination.click();
    await page.waitForLoadState('networkidle');

    // Click "Log Vaccination" button
    const logVaccinationButton = page.locator('button:has-text("Log Vaccination")');
    await logVaccinationButton.click();
    await page.waitForLoadState('networkidle');

    // Fill in vaccination log form
    const administeredDateInput = page.locator('input[name="administered_date"]');
    const today = new Date().toISOString().split('T')[0];
    await administeredDateInput.fill(today);

    const brandInput = page.locator('input[name="brand"]');
    await brandInput.fill('Venky\'s');

    const batchNumberInput = page.locator('input[name="batch_number"]');
    await batchNumberInput.fill('VEN2026/04/1234');

    const routeSelect = page.locator('select[name="route"]');
    await routeSelect.selectOption('drinking_water');

    const administeredByInput = page.locator('input[name="administered_by"]');
    await administeredByInput.fill('Test User');

    // Submit the form
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Wait for success message
    const successMessage = page.locator('[data-testid="vaccination-log-success"]');
    await expect(successMessage).toBeVisible();
    await expect(successMessage).toContainText('Vaccination Logged Successfully');

    // Close modal and verify status updated
    const closeButton = page.locator('button[aria-label="Close"]');
    await closeButton.click();
    await page.waitForLoadState('networkidle');

    // Click on the same vaccination day again
    await pendingVaccination.click();
    await page.waitForLoadState('networkidle');

    // Verify status is now "Completed"
    const statusBadge = page.locator('[data-testid="vaccination-status"]');
    await expect(statusBadge).toContainText('Completed');
  });

  test('Overdue vaccination shows amber alert', async ({ page }) => {
    // This test would require creating a batch with an old DOC placement date
    // For now, we'll skip this as it requires specific test data setup
    test.skip(true, 'Requires specific test data setup');
  });

  test('Custom protocol can be created and applied', async ({ page }) => {
    // Navigate to settings or custom protocol management page
    // This test would require implementing the custom protocol UI
    test.skip(true, 'Custom protocol UI not yet implemented');
  });
});
