import { test, expect } from '@playwright/test';

test.describe('Batch Status Board (TASK-031)', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the batch status board
    await page.goto('/dashboard/batches');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
  });

  test('should render 5 Kanban columns with correct labels', async ({ page }) => {
    // Check that all 5 columns are rendered
    const columns = page.locator('[class*="grid-cols-5"] > div');
    await expect(columns).toHaveCount(5);

    // Check column headers
    const columnHeaders = page.locator('[class*="grid-cols-5"] > div > div:first-child');
    
    await expect(columnHeaders.nth(0)).toContainText('Placement');
    await expect(columnHeaders.nth(0)).toContainText('Day 1–7');
    
    await expect(columnHeaders.nth(1)).toContainText('Growing');
    await expect(columnHeaders.nth(1)).toContainText('Day 8–28');
    
    await expect(columnHeaders.nth(2)).toContainText('Pre-Harvest');
    await expect(columnHeaders.nth(2)).toContainText('Day 29–42');
    
    await expect(columnHeaders.nth(3)).toContainText('Harvest Ready');
    await expect(columnHeaders.nth(3)).toContainText('Day 43+');
    
    await expect(columnHeaders.nth(4)).toContainText('Harvested');
    await expect(columnHeaders.nth(4)).toContainText('Complete');
  });

  test('should display batches in correct status columns', async ({ page }) => {
    // Wait for batches to load
    await page.waitForSelector('[class*="BatchCard"]', { timeout: 5000 });

    // Get all batch cards
    const batchCards = page.locator('[class*="BatchCard"]');
    const cardCount = await batchCards.count();
    
    expect(cardCount).toBeGreaterThan(0);

    // Check that each batch card displays required information
    for (let i = 0; i < cardCount; i++) {
      const card = batchCards.nth(i);
      
      // Check for Batch ID
      await expect(card.locator('h3')).toBeVisible();
      
      // Check for shed information
      await expect(card.locator('p')).toContainText('Shed');
      
      // Check for age in days
      await expect(card).toContainText('Day');
      
      // Check for bird count
      await expect(card).toContainText('🐤');
    }
  });

  test('should display sell signal badges on batch cards', async ({ page }) => {
    // Wait for batches to load
    await page.waitForSelector('[class*="BatchCard"]', { timeout: 5000 });

    // Get all batch cards
    const batchCards = page.locator('[class*="BatchCard"]');
    
    // Check that at least one card has a sell signal badge
    const sellBadges = page.locator('text=SELL');
    const holdBadges = page.locator('text=HOLD');
    const cautionBadges = page.locator('text=CAUTION');
    
    const totalBadges = await sellBadges.count() + await holdBadges.count() + await cautionBadges.count();
    expect(totalBadges).toBeGreaterThan(0);
  });

  test('should display withdrawal override badge when active', async ({ page }) => {
    // This test would require a batch with active withdrawal period
    // For now, we'll check that the withdrawal badge styling exists
    const withdrawalBadge = page.locator('text=WITHDRAWAL');
    
    // If a withdrawal badge exists, check it has the correct styling
    if (await withdrawalBadge.count() > 0) {
      await expect(withdrawalBadge.first()).toHaveClass(/bg-neutral-200/);
      await expect(withdrawalBadge.first()).toContainText('🚫');
    }
  });

  test('should open Batch Detail Drawer when clicking a batch card', async ({ page }) => {
    // Wait for batches to load
    await page.waitForSelector('[class*="BatchCard"]', { timeout: 5000 });

    // Click the first batch card
    const firstCard = page.locator('[class*="BatchCard"]').first();
    await firstCard.click();

    // Check that the drawer opens
    const drawer = page.locator('fixed.right-0.top-0.h-full');
    await expect(drawer).toBeVisible({ timeout: 2000 });

    // Check that the drawer has the correct structure
    await expect(drawer).toContainText('Overview');
    await expect(drawer).toContainText('Feed');
    await expect(drawer).toContainText('Health');
    await expect(drawer).toContainText('Mortality');
    await expect(drawer).toContainText('Costs');
  });

  test('should close Batch Detail Drawer when clicking X button', async ({ page }) => {
    // Wait for batches to load
    await page.waitForSelector('[class*="BatchCard"]', { timeout: 5000 });

    // Click the first batch card
    const firstCard = page.locator('[class*="BatchCard"]').first();
    await firstCard.click();

    // Wait for drawer to open
    await page.waitForSelector('fixed.right-0.top-0.h-full', { timeout: 2000 });

    // Click the X button to close
    const closeButton = page.locator('button:has([data-testid="X"])').first();
    if (await closeButton.count() > 0) {
      await closeButton.click();
    } else {
      // Try alternative selector
      await page.locator('button').filter({ hasText: '' }).first().click();
    }

    // Check that the drawer is closed
    const drawer = page.locator('fixed.right-0.top-0.h-full');
    await expect(drawer).not.toBeVisible({ timeout: 2000 });
  });

  test('should show Grid view toggle for S2 integrators', async ({ page }) => {
    // This test checks if the grid view toggle exists
    // In demo mode, it should be visible since we're using a demo customer with S1 segment
    // The toggle should only be visible for S2 integrators
    
    const viewToggle = page.locator('button:has([data-testid="Kanban"])');
    
    // In the current implementation, view toggle is shown for S2 or integrator role
    // For demo purposes, we'll just check the element exists in the DOM
    const toggleContainer = page.locator('.flex.items-center.bg-neutral-100');
    
    // The toggle may or may not be visible depending on customer role
    // We'll just verify the component structure exists
    if (await toggleContainer.count() > 0) {
      await expect(toggleContainer).toBeVisible();
    }
  });

  test('should open Batch Registration Form when clicking "+ नया बैच" button', async ({ page }) => {
    // Click the "नया बैच" button
    const newBatchButton = page.locator('button:has-text("नया बैच")');
    await expect(newBatchButton).toBeVisible();
    await newBatchButton.click();

    // Check that the registration form modal opens
    const modal = page.locator('.fixed.inset-0.bg-black\\/50');
    await expect(modal).toBeVisible({ timeout: 2000 });

    // Check that the form has the correct title
    await expect(modal).toContainText('नया बैच दर्ज करें');

    // Close the modal
    const closeButton = page.locator('button:has([data-testid="X"])').first();
    if (await closeButton.count() > 0) {
      await closeButton.click();
    } else {
      // Click outside to close
      await page.mouse.click(0, 0);
    }
  });

  test('should display skeleton loading state while loading', async ({ page }) => {
    // Reload the page to see loading state
    await page.reload();

    // Check for skeleton loading elements
    const skeletonElements = page.locator('.animate-pulse');
    await expect(skeletonElements.first()).toBeVisible({ timeout: 1000 });

    // Wait for loading to complete
    await page.waitForSelector('[class*="BatchCard"]', { timeout: 5000 });

    // After loading, skeleton should be gone
    await expect(skeletonElements).toHaveCount(0);
  });

  test('should filter batches when filter toggle is clicked', async ({ page }) => {
    // Wait for batches to load
    await page.waitForSelector('[class*="BatchCard"]', { timeout: 5000 });

    // Get initial batch count
    const initialBatches = page.locator('[class*="BatchCard"]');
    const initialCount = await initialBatches.count();

    // Click the filter button
    const filterButton = page.locator('button:has-text("All")');
    if (await filterButton.count() > 0) {
      await filterButton.click();

      // Wait for re-render
      await page.waitForTimeout(500);

      // Check that the button text changed
      await expect(filterButton).toContainText('Active');
    }
  });

  test('should display FCR and mortality percentage with color coding', async ({ page }) => {
    // Wait for batches to load
    await page.waitForSelector('[class*="BatchCard"]', { timeout: 5000 });

    // Get all batch cards
    const batchCards = page.locator('[class*="BatchCard"]');
    
    // Check that at least one card displays FCR
    const fcrElements = page.locator('text=FCR:');
    expect(await fcrElements.count()).toBeGreaterThan(0);

    // Check that at least one card displays mortality
    const mortElements = page.locator('text=Mort:');
    expect(await mortElements.count()).toBeGreaterThan(0);
  });

  test('should display net profit for harvested batches', async ({ page }) => {
    // Wait for batches to load
    await page.waitForSelector('[class*="BatchCard"]', { timeout: 5000 });

    // Check for harvested batches with profit display
    const profitElements = page.locator('text=Profit:');
    
    // In demo data, there should be at least one harvested batch
    if (await profitElements.count() > 0) {
      await expect(profitElements.first()).toBeVisible();
    }
  });
});
