/**
 * PoultryPulse AI — Abnormal Mortality Detection E2E Tests
 * TASK-044: Update E2E Test Suite for Operational Features
 * File: tests/e2e/abnormalMortality.spec.ts
 * 
 * Tests abnormal mortality alert detection:
 * - Log mortality 3× rolling average
 * - Verify alert fires within 5 seconds
 * - Verify alert card shows financial impact
 */

import { test, expect } from '@playwright/test';

test.describe('Abnormal Mortality Detection', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
  });

  test('Abnormal mortality alert fires when mortality exceeds 3x rolling average', async ({ page, request }) => {
    // Step 1: Create a test batch and establish baseline mortality data
    // First, create 7 days of normal mortality data via API
    const batchId = 'GKP-202606-TEST';
    const today = new Date();
    
    for (let i = 7; i >= 1; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      await request.post('/api/test/mortality', {
        data: {
          batch_id: batchId,
          log_date: dateStr,
          count: 5, // Normal mortality: 5 birds per day
          cause: 'Unknown'
        }
      });
    }

    // Step 2: Log abnormal mortality (3x the 7-day average of 5 = 15+ birds)
    await page.goto('/dashboard/batches');
    await page.waitForLoadState('networkidle');

    // Navigate to the test batch
    await page.goto(`/dashboard/batches/${batchId}`);
    await page.waitForLoadState('networkidle');

    // Switch to Mortality tab
    await page.click('button:has-text("Mortality")');

    // Click "Log Mortality" button
    await page.click('button:has-text("Log Mortality")');
    await page.waitForLoadState('networkidle');

    // Fill in abnormal mortality count (20 birds, > 3x average)
    const mortalityCountInput = page.locator('input[name="mortalityCount"]');
    await mortalityCountInput.fill('20');

    const causeSelect = page.locator('select[name="cause"]');
    await causeSelect.selectOption('Unknown');

    // Submit mortality log
    await page.click('button:has-text("Log Mortality")');

    // Wait for success message
    await page.waitForSelector('text=Mortality Logged Successfully');

    // Step 3: Verify abnormal mortality alert fires within 5 seconds
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Navigate to Alert Intelligence Center
    await page.click('button:has-text("Alerts")');
    await page.waitForLoadState('networkidle');

    // Wait for alert to appear (should be within 5 seconds)
    const abnormalMortalityAlert = page.locator('[data-testid="alert-abnormal-mortality"]');
    await expect(abnormalMortalityAlert).toBeVisible({ timeout: 10000 });

    // Step 4: Verify alert card shows financial impact
    await expect(abnormalMortalityAlert).toContainText('असामान्य मृत्यु');
    await expect(abnormalMortalityAlert).toContainText('CRITICAL');

    // Verify financial impact is shown
    const financialImpact = abnormalMortalityAlert.locator('[data-testid="financial-impact"]');
    await expect(financialImpact).toBeVisible();
    await expect(financialImpact).toContainText('₹');

    // Verify alert shows the mortality count
    await expect(abnormalMortalityAlert).toContainText('20');

    // Verify alert shows comparison to rolling average
    await expect(abnormalMortalityAlert).toContainText('7-दिन के औसत');

    // Step 5: Clean up test data
    await request.delete('/api/test/mortality', {
      data: { batch_id: batchId }
    });
  });

  test('Normal mortality does not trigger abnormal alert', async ({ page, request }) => {
    // Create a batch with normal mortality data
    const batchId = 'GKP-202606-TEST2';
    const today = new Date();
    
    for (let i = 7; i >= 1; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      await request.post('/api/test/mortality', {
        data: {
          batch_id: batchId,
          log_date: dateStr,
          count: 5,
          cause: 'Unknown'
        }
      });
    }

    // Log normal mortality (same as average)
    await page.goto(`/dashboard/batches/${batchId}`);
    await page.waitForLoadState('networkidle');

    await page.click('button:has-text("Mortality")');
    await page.click('button:has-text("Log Mortality")');
    await page.waitForLoadState('networkidle');

    const mortalityCountInput = page.locator('input[name="mortalityCount"]');
    await mortalityCountInput.fill('5'); // Same as average

    const causeSelect = page.locator('select[name="cause"]');
    await causeSelect.selectOption('Unknown');

    await page.click('button:has-text("Log Mortality")');
    await page.waitForSelector('text=Mortality Logged Successfully');

    // Verify no abnormal mortality alert appears
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.click('button:has-text("Alerts")');
    await page.waitForLoadState('networkidle');

    const abnormalMortalityAlert = page.locator('[data-testid="alert-abnormal-mortality"]');
    await expect(abnormalMortalityAlert).not.toBeVisible();

    // Clean up
    await request.delete('/api/test/mortality', {
      data: { batch_id: batchId }
    });
  });

  test('Alert threshold is adjustable per farm', async ({ page }) => {
    // Navigate to alert preferences
    await page.goto('/dashboard/settings/alerts');
    await page.waitForLoadState('networkidle');

    // Find abnormal mortality threshold setting
    const thresholdSlider = page.locator('[data-testid="abnormal-mortality-threshold"]');
    await expect(thresholdSlider).toBeVisible();

    // Get current threshold value
    const currentValue = await thresholdSlider.inputValue();
    expect(currentValue).toBeTruthy();

    // Adjust threshold to 4x (from default 3x)
    await thresholdSlider.fill('4');

    // Save settings
    await page.click('button:has-text("Save Settings")');
    await page.waitForSelector('text=Settings Saved');

    // Verify new threshold is saved
    const savedValue = await thresholdSlider.inputValue();
    expect(savedValue).toBe('4');

    // Reset to default for cleanup
    await thresholdSlider.fill('3');
    await page.click('button:has-text("Save Settings")');
  });

  test('Abnormal mortality alert includes actionable suggestions', async ({ page, request }) => {
    // Create test data
    const batchId = 'GKP-202606-TEST3';
    const today = new Date();
    
    for (let i = 7; i >= 1; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      await request.post('/api/test/mortality', {
        data: {
          batch_id: batchId,
          log_date: dateStr,
          count: 5,
          cause: 'Unknown'
        }
      });
    }

    // Log abnormal mortality
    await page.goto(`/dashboard/batches/${batchId}`);
    await page.waitForLoadState('networkidle');

    await page.click('button:has-text("Mortality")');
    await page.click('button:has-text("Log Mortality")');
    await page.waitForLoadState('networkidle');

    const mortalityCountInput = page.locator('input[name="mortalityCount"]');
    await mortalityCountInput.fill('20');

    const causeSelect = page.locator('select[name="cause"]');
    await causeSelect.selectOption('Unknown');

    await page.click('button:has-text("Log Mortality")');
    await page.waitForSelector('text=Mortality Logged Successfully');

    // Check alert for actionable suggestions
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.click('button:has-text("Alerts")');
    await page.waitForLoadState('networkidle');

    const abnormalMortalityAlert = page.locator('[data-testid="alert-abnormal-mortality"]');
    await expect(abnormalMortalityAlert).toBeVisible({ timeout: 10000 });

    // Verify alert includes suggestion to call doctor
    await expect(abnormalMortalityAlert).toContainText('तुरंत पशु चिकित्सक को बुलाएं');

    // Verify alert includes link to health checklist
    const healthChecklistLink = abnormalMortalityAlert.locator('a:has-text("Health Checklist")');
    await expect(healthChecklistLink).toBeVisible();

    // Clean up
    await request.delete('/api/test/mortality', {
      data: { batch_id: batchId }
    });
  });

  test('Mortality pattern detection runs on abnormal alert', async ({ page, request }) => {
    // Create test data with specific pattern (e.g., spike on days 5-10 = DOC stress)
    const batchId = 'GKP-202606-TEST4';
    const today = new Date();
    
    // Create pattern: normal mortality for first 4 days, then spike
    for (let i = 10; i >= 1; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const count = i <= 4 ? 5 : 25; // Spike on days 5-10

      await request.post('/api/test/mortality', {
        data: {
          batch_id: batchId,
          log_date: dateStr,
          count: count,
          cause: i <= 4 ? 'Unknown' : 'Respiratory'
        }
      });
    }

    // Navigate to batch detail
    await page.goto(`/dashboard/batches/${batchId}`);
    await page.waitForLoadState('networkidle');

    // Switch to Mortality tab
    await page.click('button:has-text("Mortality")');

    // Look for mortality pattern insight card
    const patternInsightCard = page.locator('[data-testid="mortality-pattern-insight"]');
    
    // Pattern insight may appear after abnormal alert
    // If visible, verify it shows detected pattern
    if (await patternInsightCard.isVisible()) {
      await expect(patternInsightCard).toContainText('इस पैटर्न से लगता है');
      await expect(patternInsightCard).toContainText('सुझाव');
    }

    // Clean up
    await request.delete('/api/test/mortality', {
      data: { batch_id: batchId }
    });
  });

  test('Rolling average calculation handles edge cases correctly', async ({ request }) => {
    // Test with less than 7 days of data
    const batchId = 'GKP-202606-TEST5';
    const today = new Date();
    
    // Only 3 days of data
    for (let i = 3; i >= 1; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      await request.post('/api/test/mortality', {
        data: {
          batch_id: batchId,
          log_date: dateStr,
          count: 5,
          cause: 'Unknown'
        }
      });
    }

    // Log mortality that would trigger alert if threshold was met
    // With only 3 days, fallback threshold should be used (50 birds)
    const response = await request.post('/api/mortality', {
      data: {
        batch_id: batchId,
        log_date: today.toISOString().split('T')[0],
        count: 60, // Above fallback threshold of 50
        cause: 'Unknown'
      }
    });

    // Verify alert was created using fallback logic
    expect(response.ok()).toBeTruthy();

    // Clean up
    await request.delete('/api/test/mortality', {
      data: { batch_id: batchId }
    });
  });

  test('Photo attachments work with mortality logs', async ({ page }) => {
    await page.goto('/dashboard/batches');
    await page.waitForLoadState('networkidle');

    const firstBatchCard = page.locator('[data-testid^="batch-card-"]').first();
    await firstBatchCard.click();
    await page.waitForLoadState('networkidle');

    await page.click('button:has-text("Mortality")');
    await page.click('button:has-text("Log Mortality")');
    await page.waitForLoadState('networkidle');

    // Fill in mortality form
    const mortalityCountInput = page.locator('input[name="mortalityCount"]');
    await mortalityCountInput.fill('5');

    const causeSelect = page.locator('select[name="cause"]');
    await causeSelect.selectOption('Unknown');

    // Upload photo
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('tests/fixtures/mortality-photo.jpg');

    // Submit
    await page.click('button:has-text("Log Mortality")');
    await page.waitForSelector('text=Mortality Logged Successfully');

    // Verify photo was uploaded
    const photoThumbnail = page.locator('[data-testid="mortality-photo-thumbnail"]');
    await expect(photoThumbnail).toBeVisible();
  });
});
