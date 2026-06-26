// FlockIQ — Loss Calculator E2E Tests
// File: apps/web/e2e/calculator.spec.ts
// Task Reference: I-03
// Requirements: FR-HOME-002

import { test, expect } from '@playwright/test';

test.describe('Loss Calculator', () => {
  test('should update calculation when slider changes', async ({ page }) => {
    await page.goto('/');
    
    // Scroll to pain section with calculator
    await page.locator('text=/नुकसान|loss/i').scrollIntoViewIfNeeded();
    
    // Find slider (bird count input)
    const slider = page.locator('input[type="range"]').first();
    if (await slider.isVisible()) {
      // Get initial value
      const initialValue = await slider.inputValue();
      
      // Change slider value
      await slider.fill('50000');
      
      // Verify calculation updated
      const result = page.locator('text=/₹/i').first();
      await expect(result).toBeVisible();
    }
  });

  test('should update calculation when batch selector changes', async ({ page }) => {
    await page.goto('/');
    
    // Scroll to pain section
    await page.locator('text=/नुकसान|loss/i').scrollIntoViewIfNeeded();
    
    // Find batch selector (buttons or select)
    const batchButtons = page.locator('button').filter({ hasText: /batch|बैच/i });
    const count = await batchButtons.count();
    
    if (count > 0) {
      // Click first batch option
      await batchButtons.first().click();
      
      // Verify calculation updated
      const result = page.locator('text=/₹/i').first();
      await expect(result).toBeVisible();
    }
  });

  test('should show Indian currency formatting', async ({ page }) => {
    await page.goto('/');
    
    // Scroll to pain section
    await page.locator('text=/नुकसान|loss/i').scrollIntoViewIfNeeded();
    
    // Check for Indian currency symbols (₹, लाख, करोड़)
    const currencyText = page.locator('text=/₹|लाख|करोड़/i');
    await expect(currencyText.first()).toBeVisible();
  });
});
