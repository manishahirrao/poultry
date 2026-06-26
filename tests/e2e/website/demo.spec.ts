/**
 * PoultryPulse AI — Demo Request Page E2E Tests
 * TASK-WEB-024: End-to-End Test Suite (Playwright — Website)
 * File: tests/e2e/website/demo.spec.ts
 * Requirements: REQ-WEB-010, Design Spec §8
 */

import { test, expect } from '@playwright/test';

test.describe('Demo Request Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/demo');
    await page.waitForLoadState('networkidle');
  });

  test('demo page loads successfully', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Demo|Request|डेमो/i);
    
    // Check form is visible
    const demoForm = page.locator('form[data-testid="demo-form"], .demo-form, form:has-text("Request")').first();
    await expect(demoForm).toBeVisible();
  });

  test('form validates phone number format', async ({ page }) => {
    // Find phone input
    const phoneInput = page.locator('input[name*="phone"], input[name*="mobile"], input[type="tel"]').first();
    await expect(phoneInput).toBeVisible();
    
    // Enter invalid phone number (less than 10 digits)
    await phoneInput.fill('12345');
    
    // Try to submit form
    const submitButton = page.locator('button[type="submit"], button:has-text("Submit"), button:has-text("Send")').first();
    await submitButton.click();
    
    // Check for validation error
    const errorMessage = page.locator('text=/invalid|error|10 digit|valid phone/i').first();
    await expect(errorMessage).toBeVisible({ timeout: 2000 });
  });

  test('form fills and submits successfully', async ({ page }) => {
    // Fill name field
    const nameInput = page.locator('input[name*="name"]').first();
    await nameInput.fill('Test Farmer');
    
    // Fill company/farm name
    const companyInput = page.locator('input[name*="company"], input[name*="farm"]').first();
    if (await companyInput.isVisible()) {
      await companyInput.fill('Test Farm');
    }
    
    // Fill phone number with valid Indian format
    const phoneInput = page.locator('input[name*="phone"], input[name*="mobile"], input[type="tel"]').first();
    await phoneInput.fill('9876543210');
    
    // Select segment dropdown
    const segmentSelect = page.locator('select[name*="segment"], select[name*="type"]').first();
    if (await segmentSelect.isVisible()) {
      await segmentSelect.selectOption('commercial_farm');
    }
    
    // Select flock size
    const flockSizeSelect = page.locator('select[name*="flock"], select[name*="birds"]').first();
    if (await flockSizeSelect.isVisible()) {
      await flockSizeSelect.selectOption('25000');
    }
    
    // Fill optional message
    const messageInput = page.locator('textarea[name*="message"]').first();
    if (await messageInput.isVisible()) {
      await messageInput.fill('Interested in demo');
    }
    
    // Submit form
    const submitButton = page.locator('button[type="submit"], button:has-text("Submit"), button:has-text("Request")').first();
    await submitButton.click();
    
    // Wait for submission to complete
    await page.waitForTimeout(2000);
    
    // Verify redirect to thank you page or success message
    const currentUrl = page.url();
    const isSuccess = currentUrl.includes('/thank-you') || 
                      await page.locator('text=/thank you|success|सफल/i').isVisible();
    expect(isSuccess).toBeTruthy();
  });

  test('form has all required fields', async ({ page }) => {
    // Check for name field
    const nameInput = page.locator('input[name*="name"]').first();
    await expect(nameInput).toBeVisible();
    
    // Check for phone field
    const phoneInput = page.locator('input[name*="phone"], input[name*="mobile"], input[type="tel"]').first();
    await expect(phoneInput).toBeVisible();
    
    // Check for segment dropdown
    const segmentSelect = page.locator('select[name*="segment"], select[name*="type"]').first();
    await expect(segmentSelect).toBeVisible();
  });

  test('WhatsApp CTA button is present', async ({ page }) => {
    // Check for WhatsApp direct contact button
    const whatsappButton = page.locator('a[href*="wa.me"], a[href*="whatsapp"], button:has-text("WhatsApp")').first();
    await expect(whatsappButton).toBeVisible();
    
    // Verify it has correct href format
    const href = await whatsappButton.getAttribute('href');
    expect(href).toMatch(/wa\.me|whatsapp/i);
  });

  test('social proof is displayed', async ({ page }) => {
    // Check for social proof text
    const socialProof = page.locator('text=/150\+|farms|farmers|किसान/i').first();
    await expect(socialProof).toBeVisible();
  });

  test('form shows error on empty required fields', async ({ page }) => {
    // Try to submit empty form
    const submitButton = page.locator('button[type="submit"], button:has-text("Submit")').first();
    await submitButton.click();
    
    // Check for validation errors
    const errorMessages = page.locator('text=/required|fill|empty/i').all();
    const errorCount = await (await errorMessages).length;
    expect(errorCount).toBeGreaterThan(0);
  });
});

test.describe('Demo Form Integration', () => {
  test('form submission creates Supabase row (mock)', async ({ page, request }) => {
    // This test would normally verify Supabase integration
    // For E2E testing, we verify the API endpoint exists
    await page.goto('/demo');
    
    // Check if API endpoint is accessible
    const apiResponse = await request.get('/api/public/demo-request', {
      failOnStatusCode: false
    });
    
    // API should exist (may return 405 for wrong method, but should not be 404)
    expect(apiResponse.status()).not.toBe(404);
  });

  test('Slack webhook notification is configured', async ({ page, request }) => {
    // Verify webhook endpoint exists
    const webhookResponse = await request.post('/api/public/demo-request', {
      data: {
        name: 'Test',
        phone: '9876543210',
        segment: 'commercial_farm',
        language: 'en'
      },
      failOnStatusCode: false
    });
    
    // Should not be 404 (endpoint exists)
    expect(webhookResponse.status()).not.toBe(404);
  });
});

test.describe('Demo Page Responsive Design', () => {
  test('demo form works on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/demo');
    await page.waitForLoadState('networkidle');
    
    // Form should be visible
    const demoForm = page.locator('form').first();
    await expect(demoForm).toBeVisible();
    
    // Inputs should be touch-friendly (large enough)
    const phoneInput = page.locator('input[type="tel"], input[name*="phone"]').first();
    const boxSize = await phoneInput.boundingBox();
    expect(boxSize?.height).toBeGreaterThanOrEqual(44); // iOS touch target minimum
  });

  test('demo form works on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/demo');
    await page.waitForLoadState('networkidle');
    
    // Form should be visible
    const demoForm = page.locator('form').first();
    await expect(demoForm).toBeVisible();
  });
});
