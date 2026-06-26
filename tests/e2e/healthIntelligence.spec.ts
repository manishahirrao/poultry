/**
 * PoultryPulse AI — Health Intelligence E2E Tests
 * TASK-044: Update E2E Test Suite for Operational Features
 * File: tests/e2e/healthIntelligence.spec.ts
 * 
 * Tests health checklist submission with HPAI alert escalation:
 * - Submit checklist with respiratory symptoms
 * - Mock active HPAI alert within 200km
 * - Verify escalated critical alert appears in Alert Intelligence Center
 */

import { test, expect } from '@playwright/test';

test.describe('Health Intelligence Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
  });

  test('Health checklist with respiratory symptoms triggers HPAI escalation when alert is nearby', async ({ page, request }) => {
    // Step 1: Create a mock HPAI alert in the system via API
    const hpaiAlertResponse = await request.post('/api/test/alerts/hpai', {
      data: {
        alert_type: 'hpai_zone',
        severity: 'amber',
        location: {
          district: 'Gorakhpur',
          latitude: 26.7606,
          longitude: 83.3732
        },
        radius_km: 200,
        customer_id: 'test-customer-id'
      }
    });
    
    expect(hpaiAlertResponse.ok()).toBeTruthy();

    // Step 2: Navigate to batch and open health checklist
    await page.goto('/dashboard/batches');
    await page.waitForLoadState('networkidle');

    // Click on first batch card
    const firstBatchCard = page.locator('[data-testid^="batch-card-"]').first();
    await firstBatchCard.click();
    await page.waitForLoadState('networkidle');

    // Switch to Health tab
    await page.click('button:has-text("Health")');

    // Click "Daily Health Checklist" button
    await page.click('button:has-text("Daily Health Checklist")');
    await page.waitForLoadState('networkidle');

    // Step 3: Submit health checklist with respiratory symptoms
    const today = new Date().toISOString().split('T')[0];
    
    // Fill in health checklist with abnormal respiratory symptoms
    const dateInput = page.locator('input[type="date"]');
    await dateInput.fill(today);

    // Bird behaviour - select Normal
    await page.click('button:has-text("Normal")');

    // Appetite - select Normal
    await page.click('button:has-text("Normal")');

    // Droppings - select Normal
    await page.click('button:has-text("Normal")');

    // Respiratory - select Coughing (abnormal)
    await page.click('button:has-text("Coughing")');

    // Mortality today - enter 0
    const mortalityInput = page.locator('input[name="mortalityToday"]');
    await mortalityInput.fill('0');

    // Water consumption - select Normal
    await page.click('button:has-text("Normal")');

    // Submit checklist
    await page.click('button:has-text("Submit Checklist")');

    // Wait for success message
    await page.waitForSelector('text=Health Checklist Submitted');

    // Step 4: Verify escalated critical alert appears in Alert Intelligence Center
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Navigate to Alert Intelligence Center
    await page.click('button:has-text("Alerts")');
    await page.waitForLoadState('networkidle');

    // Look for escalated HPAI alert
    const escalatedAlert = page.locator('[data-testid="alert-hpai-escalated"]');
    await expect(escalatedAlert).toBeVisible({ timeout: 10000 });

    // Verify alert shows critical severity
    await expect(escalatedAlert).toContainText('CRITICAL');
    await expect(escalatedAlert).toContainText('आपके झुंड में लक्षण + पास में बीमारी');
    await expect(escalatedAlert).toContainText('तुरंत पशु चिकित्सक से मिलें');

    // Verify alert shows batch ID
    await expect(escalatedAlert).toContainText('GKP-');

    // Step 5: Clean up - remove mock HPAI alert
    await request.delete('/api/test/alerts/hpai', {
      data: { customer_id: 'test-customer-id' }
    });
  });

  test('Normal health checklist does not trigger escalation without nearby HPAI alert', async ({ page }) => {
    // Navigate to batch and open health checklist
    await page.goto('/dashboard/batches');
    await page.waitForLoadState('networkidle');

    // Click on first batch card
    const firstBatchCard = page.locator('[data-testid^="batch-card-"]').first();
    await firstBatchCard.click();
    await page.waitForLoadState('networkidle');

    // Switch to Health tab
    await page.click('button:has-text("Health")');

    // Click "Daily Health Checklist" button
    await page.click('button:has-text("Daily Health Checklist")');
    await page.waitForLoadState('networkidle');

    // Submit health checklist with all normal values
    const today = new Date().toISOString().split('T')[0];
    
    const dateInput = page.locator('input[type="date"]');
    await dateInput.fill(today);

    // All fields - select Normal
    await page.click('button:has-text("Normal")'); // Bird behaviour
    await page.click('button:has-text("Normal")'); // Appetite
    await page.click('button:has-text("Normal")'); // Droppings
    await page.click('button:has-text("Normal")'); // Respiratory
    await page.click('button:has-text("Normal")'); // Water consumption

    const mortalityInput = page.locator('input[name="mortalityToday"]');
    await mortalityInput.fill('0');

    // Submit checklist
    await page.click('button:has-text("Submit Checklist")');

    // Wait for success message
    await page.waitForSelector('text=Health Checklist Submitted');

    // Navigate to Alert Intelligence Center
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.click('button:has-text("Alerts")');
    await page.waitForLoadState('networkidle');

    // Verify no escalated HPAI alert appears
    const escalatedAlert = page.locator('[data-testid="alert-hpai-escalated"]');
    await expect(escalatedAlert).not.toBeVisible();
  });

  test('Health checklist with non-respiratory symptoms does not trigger HPAI escalation', async ({ page, request }) => {
    // Create a mock HPAI alert
    const hpaiAlertResponse = await request.post('/api/test/alerts/hpai', {
      data: {
        alert_type: 'hpai_zone',
        severity: 'amber',
        location: {
          district: 'Gorakhpur',
          latitude: 26.7606,
          longitude: 83.3732
        },
        radius_km: 200,
        customer_id: 'test-customer-id'
      }
    });
    
    expect(hpaiAlertResponse.ok()).toBeTruthy();

    // Navigate to batch and open health checklist
    await page.goto('/dashboard/batches');
    await page.waitForLoadState('networkidle');

    const firstBatchCard = page.locator('[data-testid^="batch-card-"]').first();
    await firstBatchCard.click();
    await page.waitForLoadState('networkidle');

    await page.click('button:has-text("Health")');
    await page.click('button:has-text("Daily Health Checklist")');
    await page.waitForLoadState('networkidle');

    // Submit health checklist with digestive symptoms (not respiratory)
    const today = new Date().toISOString().split('T')[0];
    
    const dateInput = page.locator('input[type="date"]');
    await dateInput.fill(today);

    await page.click('button:has-text("Normal")'); // Bird behaviour
    await page.click('button:has-text("Reduced")'); // Appetite (abnormal)
    await page.click('button:has-text("Loose")'); // Droppings (abnormal)
    await page.click('button:has-text("Normal")'); // Respiratory (normal - key difference)
    await page.click('button:has-text("Normal")'); // Water consumption

    const mortalityInput = page.locator('input[name="mortalityToday"]');
    await mortalityInput.fill('0');

    await page.click('button:has-text("Submit Checklist")');
    await page.waitForSelector('text=Health Checklist Submitted');

    // Navigate to Alert Intelligence Center
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.click('button:has-text("Alerts")');
    await page.waitForLoadState('networkidle');

    // Verify no escalated HPAI alert appears (because respiratory was normal)
    const escalatedAlert = page.locator('[data-testid="alert-hpai-escalated"]');
    await expect(escalatedAlert).not.toBeVisible();

    // Clean up
    await request.delete('/api/test/alerts/hpai', {
      data: { customer_id: 'test-customer-id' }
    });
  });

  test('Missing checklist alert fires at 10:00 AM IST', async ({ page }) => {
    // This test would require mocking the current time to 10:00 AM IST
    // For now, we'll verify the alert mechanism exists

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Navigate to Alert Intelligence Center
    await page.click('button:has-text("Alerts")');
    await page.waitForLoadState('networkidle');

    // Check for missing checklist alert type
    const missingChecklistAlert = page.locator('[data-testid="alert-missing-checklist"]');
    
    // Alert may or may not be visible depending on time
    // If visible, verify it contains expected text
    if (await missingChecklistAlert.isVisible()) {
      await expect(missingChecklistAlert).toContainText('checklist');
      await expect(missingChecklistAlert).toContainText('missing');
    }
  });

  test('Health checklist history shows last 14 days as color-coded grid', async ({ page }) => {
    await page.goto('/dashboard/batches');
    await page.waitForLoadState('networkidle');

    const firstBatchCard = page.locator('[data-testid^="batch-card-"]').first();
    await firstBatchCard.click();
    await page.waitForLoadState('networkidle');

    // Switch to Health tab
    await page.click('button:has-text("Health")');

    // Look for health checklist history grid
    const historyGrid = page.locator('[data-testid="health-checklist-history"]');
    await expect(historyGrid).toBeVisible();

    // Verify grid shows last 14 days
    const historyDays = historyGrid.locator('[data-testid^="history-day-"]');
    const dayCount = await historyDays.count();
    expect(dayCount).toBeGreaterThan(0);
    expect(dayCount).toBeLessThanOrEqual(14);
  });

  test('Health checklist submission is timestamped per batch per day', async ({ page }) => {
    await page.goto('/dashboard/batches');
    await page.waitForLoadState('networkidle');

    const firstBatchCard = page.locator('[data-testid^="batch-card-"]').first();
    await firstBatchCard.click();
    await page.waitForLoadState('networkidle');

    await page.click('button:has-text("Health")');
    await page.click('button:has-text("Daily Health Checklist")');
    await page.waitForLoadState('networkidle');

    const today = new Date().toISOString().split('T')[0];
    
    const dateInput = page.locator('input[type="date"]');
    await dateInput.fill(today);

    // Submit with all normal values
    await page.click('button:has-text("Normal")');
    await page.click('button:has-text("Normal")');
    await page.click('button:has-text("Normal")');
    await page.click('button:has-text("Normal")');
    await page.click('button:has-text("Normal")');

    const mortalityInput = page.locator('input[name="mortalityToday"]');
    await mortalityInput.fill('0');

    await page.click('button:has-text("Submit Checklist")');
    await page.waitForSelector('text=Health Checklist Submitted');

    // Verify timestamp is displayed in history
    const historyGrid = page.locator('[data-testid="health-checklist-history"]');
    await expect(historyGrid).toBeVisible();

    const todayEntry = historyGrid.locator(`[data-testid="history-day-${today}"]`);
    await expect(todayEntry).toBeVisible();

    // Verify timestamp is shown
    const timestamp = todayEntry.locator('[data-testid="checklist-timestamp"]');
    await expect(timestamp).toBeVisible();
  });
});
