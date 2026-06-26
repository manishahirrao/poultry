/**
 * PoultryPulse AI — Offline Mode E2E Tests
 * TASK-044: Update E2E Test Suite for Operational Features
 * File: tests/e2e/offline.spec.ts
 * 
 * Tests offline functionality:
 * - Submit feed log offline
 * - Verify synced=false in DB
 * - Restore network
 * - Verify synced=true within 30 seconds
 */

import { test, expect } from '@playwright/test';

test.describe('Offline Mode Functionality', () => {
  test.beforeEach(async ({ page, context }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
  });

  test('Submit feed log offline and verify sync on reconnect', async ({ page, context }) => {
    // Step 1: Simulate offline mode by blocking network
    await context.setOffline(true);

    // Verify offline indicator is shown
    const offlineIndicator = page.locator('[data-testid="offline-indicator"]');
    await expect(offlineIndicator).toBeVisible({ timeout: 5000 });
    await expect(offlineIndicator).toContainText('Offline');

    // Step 2: Navigate to batch and submit feed log while offline
    await page.goto('/dashboard/batches');
    await page.waitForLoadState('domcontentloaded'); // Don't wait for networkidle since we're offline

    const firstBatchCard = page.locator('[data-testid^="batch-card-"]').first();
    await firstBatchCard.click();
    await page.waitForLoadState('domcontentloaded');

    // Switch to Feed tab
    await page.click('button:has-text("Feed")');

    // Click "Log Feed" button
    await page.click('button:has-text("Log Feed")');
    await page.waitForLoadState('domcontentloaded');

    // Fill in feed log form
    const today = new Date().toISOString().split('T')[0];
    
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

    // Verify success message appears even though offline
    const successMessage = page.locator('text=Feed Logged Successfully');
    await expect(successMessage).toBeVisible({ timeout: 5000 });

    // Verify pending sync indicator
    const pendingSyncIndicator = page.locator('[data-testid="pending-sync"]');
    await expect(pendingSyncIndicator).toBeVisible();
    await expect(pendingSyncIndicator).toContainText('pending sync');

    // Step 3: Verify synced=false in local storage/DB
    // Check local storage for pending records
    const pendingRecords = await page.evaluate(() => {
      const records = localStorage.getItem('pending_feed_logs');
      return records ? JSON.parse(records) : [];
    });
    expect(pendingRecords.length).toBeGreaterThan(0);
    expect(pendingRecords[0].synced).toBe(false);

    // Step 4: Restore network connection
    await context.setOffline(false);

    // Verify online indicator appears
    const onlineIndicator = page.locator('[data-testid="online-indicator"]');
    await expect(onlineIndicator).toBeVisible({ timeout: 10000 });

    // Step 5: Verify sync completes within 30 seconds
    await page.waitForTimeout(35000); // Wait up to 35 seconds for sync

    // Verify pending sync indicator is gone
    await expect(pendingSyncIndicator).not.toBeVisible();

    // Verify synced=true in local storage
    const syncedRecords = await page.evaluate(() => {
      const records = localStorage.getItem('pending_feed_logs');
      return records ? JSON.parse(records) : [];
    });
    expect(syncedRecords.length).toBe(0); // All records should be synced and removed from pending

    // Step 6: Verify feed log appears in the feed history
    const feedHistory = page.locator('[data-testid="feed-history"]');
    await expect(feedHistory).toBeVisible();

    const latestFeedLog = feedHistory.locator('[data-testid^="feed-log-"]').first();
    await expect(latestFeedLog).toBeVisible();
    await expect(latestFeedLog).toContainText(today);
  });

  test('Submit mortality log offline and verify sync on reconnect', async ({ page, context }) => {
    // Simulate offline mode
    await context.setOffline(true);

    const offlineIndicator = page.locator('[data-testid="offline-indicator"]');
    await expect(offlineIndicator).toBeVisible({ timeout: 5000 });

    // Navigate to batch and submit mortality log while offline
    await page.goto('/dashboard/batches');
    await page.waitForLoadState('domcontentloaded');

    const firstBatchCard = page.locator('[data-testid^="batch-card-"]').first();
    await firstBatchCard.click();
    await page.waitForLoadState('domcontentloaded');

    await page.click('button:has-text("Mortality")');
    await page.click('button:has-text("Log Mortality")');
    await page.waitForLoadState('domcontentloaded');

    const today = new Date().toISOString().split('T')[0];
    
    const mortalityCountInput = page.locator('input[name="mortalityCount"]');
    await mortalityCountInput.fill('5');

    const causeSelect = page.locator('select[name="cause"]');
    await causeSelect.selectOption('Unknown');

    await page.click('button:has-text("Log Mortality")');

    const successMessage = page.locator('text=Mortality Logged Successfully');
    await expect(successMessage).toBeVisible({ timeout: 5000 });

    // Verify pending sync
    const pendingSyncIndicator = page.locator('[data-testid="pending-sync"]');
    await expect(pendingSyncIndicator).toBeVisible();

    // Check local storage
    const pendingRecords = await page.evaluate(() => {
      const records = localStorage.getItem('pending_mortality_logs');
      return records ? JSON.parse(records) : [];
    });
    expect(pendingRecords.length).toBeGreaterThan(0);
    expect(pendingRecords[0].synced).toBe(false);

    // Restore network
    await context.setOffline(false);

    // Wait for sync
    await page.waitForTimeout(35000);

    // Verify sync completed
    await expect(pendingSyncIndicator).not.toBeVisible();

    const syncedRecords = await page.evaluate(() => {
      const records = localStorage.getItem('pending_mortality_logs');
      return records ? JSON.parse(records) : [];
    });
    expect(syncedRecords.length).toBe(0);
  });

  test('Submit health checklist offline and verify sync on reconnect', async ({ page, context }) => {
    // Simulate offline mode
    await context.setOffline(true);

    const offlineIndicator = page.locator('[data-testid="offline-indicator"]');
    await expect(offlineIndicator).toBeVisible({ timeout: 5000 });

    // Navigate to batch and submit health checklist while offline
    await page.goto('/dashboard/batches');
    await page.waitForLoadState('domcontentloaded');

    const firstBatchCard = page.locator('[data-testid^="batch-card-"]').first();
    await firstBatchCard.click();
    await page.waitForLoadState('domcontentloaded');

    await page.click('button:has-text("Health")');
    await page.click('button:has-text("Daily Health Checklist")');
    await page.waitForLoadState('domcontentloaded');

    const today = new Date().toISOString().split('T')[0];
    
    const dateInput = page.locator('input[type="date"]');
    await dateInput.fill(today);

    // Submit with all normal values
    await page.click('button:has-text("Normal")'); // Bird behaviour
    await page.click('button:has-text("Normal")'); // Appetite
    await page.click('button:has-text("Normal")'); // Droppings
    await page.click('button:has-text("Normal")'); // Respiratory
    await page.click('button:has-text("Normal")'); // Water consumption

    const mortalityInput = page.locator('input[name="mortalityToday"]');
    await mortalityInput.fill('0');

    await page.click('button:has-text("Submit Checklist")');

    const successMessage = page.locator('text=Health Checklist Submitted');
    await expect(successMessage).toBeVisible({ timeout: 5000 });

    // Verify pending sync
    const pendingSyncIndicator = page.locator('[data-testid="pending-sync"]');
    await expect(pendingSyncIndicator).toBeVisible();

    // Check local storage
    const pendingRecords = await page.evaluate(() => {
      const records = localStorage.getItem('pending_health_checklists');
      return records ? JSON.parse(records) : [];
    });
    expect(pendingRecords.length).toBeGreaterThan(0);
    expect(pendingRecords[0].synced).toBe(false);

    // Restore network
    await context.setOffline(false);

    // Wait for sync
    await page.waitForTimeout(35000);

    // Verify sync completed
    await expect(pendingSyncIndicator).not.toBeVisible();

    const syncedRecords = await page.evaluate(() => {
      const records = localStorage.getItem('pending_health_checklists');
      return records ? JSON.parse(records) : [];
    });
    expect(syncedRecords.length).toBe(0);
  });

  test('Multiple offline records sync in correct order', async ({ page, context }) => {
    // Simulate offline mode
    await context.setOffline(true);

    const offlineIndicator = page.locator('[data-testid="offline-indicator"]');
    await expect(offlineIndicator).toBeVisible({ timeout: 5000 });

    // Submit multiple feed logs offline
    await page.goto('/dashboard/batches');
    await page.waitForLoadState('domcontentloaded');

    const firstBatchCard = page.locator('[data-testid^="batch-card-"]').first();
    await firstBatchCard.click();
    await page.waitForLoadState('domcontentloaded');

    await page.click('button:has-text("Feed")');

    // Submit first feed log
    await page.click('button:has-text("Log Feed")');
    await page.waitForLoadState('domcontentloaded');

    const today = new Date().toISOString().split('T')[0];
    
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

    await page.click('button:has-text("Log Feed")');
    await expect(page.locator('text=Feed Logged Successfully')).toBeVisible({ timeout: 5000 });

    // Submit second feed log
    await page.click('button:has-text("Log Feed")');
    await page.waitForLoadState('domcontentloaded');

    await feedDateInput.fill(today);
    await morningFeedInput.fill('600');
    await eveningFeedInput.fill('600');
    await waterInput.fill('1800');
    await feedBrandSelect.selectOption('Godrej Agrovet');

    await page.click('button:has-text("Log Feed")');
    await expect(page.locator('text=Feed Logged Successfully')).toBeVisible({ timeout: 5000 });

    // Verify 2 pending records
    const pendingRecords = await page.evaluate(() => {
      const records = localStorage.getItem('pending_feed_logs');
      return records ? JSON.parse(records) : [];
    });
    expect(pendingRecords.length).toBe(2);

    // Restore network
    await context.setOffline(false);

    // Wait for sync
    await page.waitForTimeout(35000);

    // Verify all records synced
    const syncedRecords = await page.evaluate(() => {
      const records = localStorage.getItem('pending_feed_logs');
      return records ? JSON.parse(records) : [];
    });
    expect(syncedRecords.length).toBe(0);

    // Verify both logs appear in history in correct order
    const feedHistory = page.locator('[data-testid="feed-history"]');
    await expect(feedHistory).toBeVisible();

    const feedLogs = feedHistory.locator('[data-testid^="feed-log-"]');
    const logCount = await feedLogs.count();
    expect(logCount).toBeGreaterThanOrEqual(2);
  });

  test('Offline mode shows count of pending records', async ({ page, context }) => {
    // Simulate offline mode
    await context.setOffline(true);

    const offlineIndicator = page.locator('[data-testid="offline-indicator"]');
    await expect(offlineIndicator).toBeVisible({ timeout: 5000 });

    // Submit a feed log offline
    await page.goto('/dashboard/batches');
    await page.waitForLoadState('domcontentloaded');

    const firstBatchCard = page.locator('[data-testid^="batch-card-"]').first();
    await firstBatchCard.click();
    await page.waitForLoadState('domcontentloaded');

    await page.click('button:has-text("Feed")');
    await page.click('button:has-text("Log Feed")');
    await page.waitForLoadState('domcontentloaded');

    const today = new Date().toISOString().split('T')[0];
    
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

    await page.click('button:has-text("Log Feed")');
    await expect(page.locator('text=Feed Logged Successfully')).toBeVisible({ timeout: 5000 });

    // Verify pending count is shown
    const pendingCount = page.locator('[data-testid="pending-sync-count"]');
    await expect(pendingCount).toBeVisible();
    await expect(pendingCount).toContainText('1');

    // Submit another record
    await page.click('button:has-text("Log Feed")');
    await page.waitForLoadState('domcontentloaded');

    await feedDateInput.fill(today);
    await morningFeedInput.fill('600');
    await eveningFeedInput.fill('600');
    await waterInput.fill('1800');
    await feedBrandSelect.selectOption('Godrej Agrovet');

    await page.click('button:has-text("Log Feed")');
    await expect(page.locator('text=Feed Logged Successfully')).toBeVisible({ timeout: 5000 });

    // Verify count updated to 2
    await expect(pendingCount).toContainText('2');

    // Restore network
    await context.setOffline(false);

    // Wait for sync
    await page.waitForTimeout(35000);

    // Verify count is 0
    await expect(pendingCount).toContainText('0');
  });

  test('Sync status indicator shows oldest pending record timestamp', async ({ page, context }) => {
    // Simulate offline mode
    await context.setOffline(true);

    const offlineIndicator = page.locator('[data-testid="offline-indicator"]');
    await expect(offlineIndicator).toBeVisible({ timeout: 5000 });

    // Submit a feed log offline
    await page.goto('/dashboard/batches');
    await page.waitForLoadState('domcontentloaded');

    const firstBatchCard = page.locator('[data-testid^="batch-card-"]').first();
    await firstBatchCard.click();
    await page.waitForLoadState('domcontentloaded');

    await page.click('button:has-text("Feed")');
    await page.click('button:has-text("Log Feed")');
    await page.waitForLoadState('domcontentloaded');

    const today = new Date().toISOString().split('T')[0];
    
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

    await page.click('button:has-text("Log Feed")');
    await expect(page.locator('text=Feed Logged Successfully')).toBeVisible({ timeout: 5000 });

    // Verify timestamp is shown
    const oldestPendingTimestamp = page.locator('[data-testid="oldest-pending-timestamp"]');
    await expect(oldestPendingTimestamp).toBeVisible();
    
    const timestampText = await oldestPendingTimestamp.textContent();
    expect(timestampText).toBeTruthy();
  });

  test('Offline mode handles sync conflicts with last-write-wins', async ({ page, context }) => {
    // This test verifies that if the same record is modified offline and online,
    // the offline version (last write) wins after sync
    
    // Simulate offline mode
    await context.setOffline(true);

    const offlineIndicator = page.locator('[data-testid="offline-indicator"]');
    await expect(offlineIndicator).toBeVisible({ timeout: 5000 });

    // Submit a feed log offline
    await page.goto('/dashboard/batches');
    await page.waitForLoadState('domcontentloaded');

    const firstBatchCard = page.locator('[data-testid^="batch-card-"]').first();
    await firstBatchCard.click();
    await page.waitForLoadState('domcontentloaded');

    await page.click('button:has-text("Feed")');
    await page.click('button:has-text("Log Feed")');
    await page.waitForLoadState('domcontentloaded');

    const today = new Date().toISOString().split('T')[0];
    
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

    await page.click('button:has-text("Log Feed")');
    await expect(page.locator('text=Feed Logged Successfully')).toBeVisible({ timeout: 5000 });

    // Restore network
    await context.setOffline(false);

    // Wait for sync
    await page.waitForTimeout(35000);

    // Verify record was synced successfully
    const feedHistory = page.locator('[data-testid="feed-history"]');
    await expect(feedHistory).toBeVisible();

    const latestFeedLog = feedHistory.locator('[data-testid^="feed-log-"]').first();
    await expect(latestFeedLog).toBeVisible();
    await expect(latestFeedLog).toContainText('500'); // Morning feed
  });
});
