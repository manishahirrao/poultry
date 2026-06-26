import { test, expect } from '@playwright/test';

test.describe('Batch Traceability Report & FSSAI PDF', () => {
  test.beforeEach(async ({ page }) => {
    // Login as a test user
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'testpassword123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('should show View Traceability button only for harvested batches', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Navigate to batch status board
    await page.click('text=Batch Status');
    await page.waitForURL('/dashboard/batches');
    
    // Find a harvested batch and click on it
    const harvestedBatch = page.locator('[data-status="harvested"]').first();
    if (await harvestedBatch.isVisible()) {
      await harvestedBatch.click();
      
      // Wait for drawer to open
      await page.waitForSelector('[data-testid="batch-detail-drawer"]', { state: 'visible' });
      
      // Verify "View Traceability" button is visible
      const traceabilityButton = page.locator('button:has-text("View Traceability")');
      await expect(traceabilityButton).toBeVisible();
    }
  });

  test('should not show View Traceability button for non-harvested batches', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Navigate to batch status board
    await page.click('text=Batch Status');
    await page.waitForURL('/dashboard/batches');
    
    // Find a non-harvested batch and click on it
    const activeBatch = page.locator('[data-status="growing"]').first();
    if (await activeBatch.isVisible()) {
      await activeBatch.click();
      
      // Wait for drawer to open
      await page.waitForSelector('[data-testid="batch-detail-drawer"]', { state: 'visible' });
      
      // Verify "View Traceability" button is not visible
      const traceabilityButton = page.locator('button:has-text("View Traceability")');
      await expect(traceabilityButton).not.toBeVisible();
      
      // Verify "Mark as Harvested" button is visible instead
      const harvestButton = page.locator('button:has-text("Mark as Harvested")');
      await expect(harvestButton).toBeVisible();
    }
  });

  test('should generate traceability report when View Traceability is clicked', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Navigate to batch status board
    await page.click('text=Batch Status');
    await page.waitForURL('/dashboard/batches');
    
    // Find a harvested batch and click on it
    const harvestedBatch = page.locator('[data-status="harvested"]').first();
    if (await harvestedBatch.isVisible()) {
      await harvestedBatch.click();
      
      // Wait for drawer to open
      await page.waitForSelector('[data-testid="batch-detail-drawer"]', { state: 'visible' });
      
      // Click "View Traceability" button
      await page.click('button:has-text("View Traceability")');
      
      // Wait for traceability modal to open
      await page.waitForSelector('[data-testid="traceability-modal"]', { state: 'visible' });
      
      // Verify modal content
      await expect(page.locator('text=Traceability Report')).toBeVisible();
      await expect(page.locator('text=Generating traceability report...')).not.toBeVisible();
      
      // Verify batch information is displayed
      await expect(page.locator('text=Breed')).toBeVisible();
      await expect(page.locator('text=Harvest Date')).toBeVisible();
      await expect(page.locator('text=Total Feed')).toBeVisible();
      await expect(page.locator('text=FCR')).toBeVisible();
      
      // Verify AB-Free badge is displayed
      await expect(page.locator('text=Antibiotic Use')).toBeVisible();
      
      // Verify FSSAI status is displayed
      await expect(page.locator('text=FSSAI Status')).toBeVisible();
      
      // Verify public verification URL is displayed
      await expect(page.locator('text=Public Verification URL')).toBeVisible();
      await expect(page.locator('text=poulse.ai/trace/')).toBeVisible();
      
      // Verify download button is present
      const downloadButton = page.locator('button:has-text("Download Traceability Report")');
      await expect(downloadButton).toBeVisible();
    }
  });

  test('should close traceability modal when Close button is clicked', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Navigate to batch status board
    await page.click('text=Batch Status');
    await page.waitForURL('/dashboard/batches');
    
    // Find a harvested batch and click on it
    const harvestedBatch = page.locator('[data-status="harvested"]').first();
    if (await harvestedBatch.isVisible()) {
      await harvestedBatch.click();
      
      // Wait for drawer to open
      await page.waitForSelector('[data-testid="batch-detail-drawer"]', { state: 'visible' });
      
      // Click "View Traceability" button
      await page.click('button:has-text("View Traceability")');
      
      // Wait for traceability modal to open
      await page.waitForSelector('[data-testid="traceability-modal"]', { state: 'visible' });
      
      // Click Close button
      await page.click('button:has-text("Close")');
      
      // Verify modal is closed
      await expect(page.locator('[data-testid="traceability-modal"]')).not.toBeVisible();
    }
  });

  test('should display correct AB-Free badge for batches without antibiotics', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Navigate to batch status board
    await page.click('text=Batch Status');
    await page.waitForURL('/dashboard/batches');
    
    // Find a harvested batch and click on it
    const harvestedBatch = page.locator('[data-status="harvested"]').first();
    if (await harvestedBatch.isVisible()) {
      await harvestedBatch.click();
      
      // Wait for drawer to open
      await page.waitForSelector('[data-testid="batch-detail-drawer"]', { state: 'visible' });
      
      // Click "View Traceability" button
      await page.click('button:has-text("View Traceability")');
      
      // Wait for traceability modal to open
      await page.waitForSelector('[data-testid="traceability-modal"]', { state: 'visible' });
      
      // Verify AB-Free badge shows green for batches without antibiotics
      const abFreeBadge = page.locator('text=AB-Free Eligible');
      if (await abFreeBadge.isVisible()) {
        await expect(abFreeBadge).toHaveCSS('color', 'rgb(22, 163, 74)'); // green-600
      }
    }
  });

  test('should display correct AB badge for batches with antibiotics', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Navigate to batch status board
    await page.click('text=Batch Status');
    await page.waitForURL('/dashboard/batches');
    
    // Find a harvested batch and click on it
    const harvestedBatch = page.locator('[data-status="harvested"]').first();
    if (await harvestedBatch.isVisible()) {
      await harvestedBatch.click();
      
      // Wait for drawer to open
      await page.waitForSelector('[data-testid="batch-detail-drawer"]', { state: 'visible' });
      
      // Click "View Traceability" button
      await page.click('button:has-text("View Traceability")');
      
      // Wait for traceability modal to open
      await page.waitForSelector('[data-testid="traceability-modal"]', { state: 'visible' });
      
      // Verify AB badge shows red for batches with antibiotics
      const abUsedBadge = page.locator('text=AB Used');
      if (await abUsedBadge.isVisible()) {
        await expect(abUsedBadge).toHaveCSS('color', 'rgb(220, 38, 38)'); // red-600
      }
    }
  });

  test('should navigate to public traceability page via URL', async ({ page }) => {
    // Navigate directly to a public traceability page
    await page.goto('/trace/GKP-202604-003');
    
    // Verify the page loads
    await expect(page.locator('text=PoultryPulse AI')).toBeVisible();
    await expect(page.locator('text=Batch Traceability Verification')).toBeVisible();
    await expect(page.locator('text=GKP-202604-003')).toBeVisible();
    
    // Verify batch information is displayed
    await expect(page.locator('text=Farm Information')).toBeVisible();
    await expect(page.locator('text=Batch Performance')).toBeVisible();
    await expect(page.locator('text=Health & Vaccination')).toBeVisible();
    await expect(page.locator('text=Certification Status')).toBeVisible();
    
    // Verify FSSAI status is displayed
    await expect(page.locator('text=FSSAI Compliant')).toBeVisible();
    
    // Verify AB-Free status is displayed
    await expect(page.locator('text=AB-Free Eligible')).toBeVisible();
  });

  test('should show batch not found for invalid batch ID', async ({ page }) => {
    // Navigate to an invalid batch ID
    await page.goto('/trace/INVALID-BATCH-ID');
    
    // Verify error message is displayed
    await expect(page.locator('text=Batch Not Found')).toBeVisible();
    await expect(page.locator('text=The traceability information for this batch could not be found')).toBeVisible();
  });

  test('complete batch lifecycle: mark harvested -> generate traceability -> verify public page', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Navigate to batch status board
    await page.click('text=Batch Status');
    await page.waitForURL('/dashboard/batches');
    
    // Find a growing batch
    const growingBatch = page.locator('[data-status="growing"]').first();
    if (await growingBatch.isVisible()) {
      await growingBatch.click();
      
      // Wait for drawer to open
      await page.waitForSelector('[data-testid="batch-detail-drawer"]', { state: 'visible' });
      
      // Click "Mark as Harvested" button
      await page.click('button:has-text("Mark as Harvested")');
      
      // Fill harvest form
      await page.fill('input[placeholder*="kg/bird"]', '2.18');
      await page.fill('input[placeholder*="Bird Count"]', '24493');
      await page.fill('input[placeholder*="₹/kg"]', '164.20');
      await page.fill('input[placeholder*="Buyer"]', 'Test Buyer');
      
      // Submit harvest
      await page.click('button:has-text("Confirm Harvest")');
      
      // Wait for drawer to close and refresh
      await page.waitForTimeout(2000);
      
      // Navigate back to batch status board
      await page.goto('/dashboard/batches');
      
      // Find the now-harvested batch
      const harvestedBatch = page.locator('[data-status="harvested"]').first();
      await harvestedBatch.click();
      
      // Wait for drawer to open
      await page.waitForSelector('[data-testid="batch-detail-drawer"]', { state: 'visible' });
      
      // Click "View Traceability" button
      await page.click('button:has-text("View Traceability")');
      
      // Wait for traceability modal to open
      await page.waitForSelector('[data-testid="traceability-modal"]', { state: 'visible' });
      
      // Get the batch ID from the modal
      const batchId = await page.locator('text=poulse.ai/trace/').textContent();
      const extractedBatchId = batchId?.split('/').pop();
      
      // Close the modal
      await page.click('button:has-text("Close")');
      
      // Navigate to the public traceability page
      if (extractedBatchId) {
        await page.goto(`/trace/${extractedBatchId}`);
        
        // Verify the public page loads and shows the correct information
        await expect(page.locator('text=PoultryPulse AI')).toBeVisible();
        await expect(page.locator(`text=${extractedBatchId}`)).toBeVisible();
        await expect(page.locator('text=FSSAI Compliant')).toBeVisible();
      }
    }
  });
});
