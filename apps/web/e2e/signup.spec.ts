// FlockIQ — Sign-up Flow E2E Tests
// File: apps/web/e2e/signup.spec.ts
// Task Reference: I-03
// Requirements: FR-LEADS-001, FR-TECH-004

import { test, expect } from '@playwright/test';

test.describe('Sign-up Flow', () => {
  test('should navigate to signup page', async ({ page }) => {
    await page.goto('/');
    
    const signupButton = page.getByRole('link', { name: /₹0 में शुरू करें|Start Free/i });
    await signupButton.click();
    
    await expect(page).toHaveURL(/\/signup/);
  });

  test('should have phone input field with +91 prefix', async ({ page }) => {
    await page.goto('/signup');
    
    const phoneInput = page.locator('input[type="tel"]');
    await expect(phoneInput).toBeVisible();
    
    // Check for +91 prefix
    const prefix = page.locator('text=+91');
    await expect(prefix).toBeVisible();
  });

  test('should validate Indian phone number format', async ({ page }) => {
    await page.goto('/signup');
    
    const phoneInput = page.locator('input[type="tel"]');
    await phoneInput.fill('12345');
    
    // Should not show error for incomplete number
    const error = page.locator('text=/invalid|correct|सही/i');
    await expect(error).not.toBeVisible();
    
    // Test invalid starting digit
    await phoneInput.fill('5123456789');
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    
    // Should show validation error for invalid format
    await expect(error.first()).toBeVisible();
  });

  test('should accept valid Indian phone number', async ({ page }) => {
    await page.goto('/signup');
    
    const phoneInput = page.locator('input[type="tel"]');
    await phoneInput.fill('9876543210');
    
    // Should not show error for valid number
    const error = page.locator('text=/invalid|correct|सही/i');
    await expect(error).not.toBeVisible();
  });

  test('should have DPDP consent checkbox', async ({ page }) => {
    await page.goto('/signup');
    
    const consentCheckbox = page.locator('input[type="checkbox"]');
    await expect(consentCheckbox).toBeVisible();
    
    // Check if consent label mentions DPDP
    const consentLabel = page.locator('text=/DPDP|consent|सहमति|Privacy Policy/i');
    await expect(consentLabel.first()).toBeVisible();
    
    // Checkbox should be unchecked by default
    await expect(consentCheckbox).not.toBeChecked();
  });

  test('should disable submit button until phone and consent are filled', async ({ page }) => {
    await page.goto('/signup');
    
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeDisabled();
    
    const phoneInput = page.locator('input[type="tel"]');
    await phoneInput.fill('9876543210');
    
    // Still disabled without consent
    await expect(submitButton).toBeDisabled();
    
    const consentCheckbox = page.locator('input[type="checkbox"]');
    await consentCheckbox.check();
    
    // Now enabled
    await expect(submitButton).toBeEnabled();
  });

  test('should show OTP verification screen after phone submission', async ({ page }) => {
    await page.goto('/signup');
    
    const phoneInput = page.locator('input[type="tel"]');
    await phoneInput.fill('9876543210');
    
    const consentCheckbox = page.locator('input[type="checkbox"]');
    await consentCheckbox.check();
    
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    
    // Wait for OTP screen to appear
    await page.waitForTimeout(1500);
    
    // Check for OTP inputs
    const otpInputs = page.locator('input[type="text"]');
    await expect(otpInputs).toHaveCount(6);
  });

  test('should have 6 OTP input boxes with auto-advance', async ({ page }) => {
    await page.goto('/signup');
    
    const phoneInput = page.locator('input[type="tel"]');
    await phoneInput.fill('9876543210');
    
    const consentCheckbox = page.locator('input[type="checkbox"]');
    await consentCheckbox.check();
    
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    
    await page.waitForTimeout(1500);
    
    const otpInputs = page.locator('input[type="text"]');
    await expect(otpInputs).toHaveCount(6);
    
    // Test auto-advance by typing in first box
    await otpInputs.nth(0).fill('1');
    
    // Focus should move to next input
    await expect(otpInputs.nth(1)).toBeFocused();
  });

  test('should have language toggle', async ({ page }) => {
    await page.goto('/signup');
    
    const languageToggle = page.locator('button', { hasText: /English|हिंदी/i });
    await expect(languageToggle).toBeVisible();
    
    // Test toggle
    await languageToggle.click();
    await expect(languageToggle).toHaveText(/हिंदी/i);
    
    await languageToggle.click();
    await expect(languageToggle).toHaveText(/English/i);
  });

  test('should show trust signals', async ({ page }) => {
    await page.goto('/signup');
    
    const trustSignal = page.locator('text=/14-day free trial|No credit card required/i');
    await expect(trustSignal).toBeVisible();
  });

  test('should have social auth button', async ({ page }) => {
    await page.goto('/signup');
    
    const googleButton = page.locator('button', { hasText: /Google/i });
    await expect(googleButton).toBeVisible();
  });

  test('should show social proof', async ({ page }) => {
    await page.goto('/signup');
    
    const socialProof = page.locator('text=/200+|farmers|किसान/i');
    await expect(socialProof).toBeVisible();
  });

  test('should have countdown timer on OTP screen', async ({ page }) => {
    await page.goto('/signup');
    
    const phoneInput = page.locator('input[type="tel"]');
    await phoneInput.fill('9876543210');
    
    const consentCheckbox = page.locator('input[type="checkbox"]');
    await consentCheckbox.check();
    
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    
    await page.waitForTimeout(1500);
    
    const countdown = page.locator('text=/OTP.*expires|expire होगा/i');
    await expect(countdown).toBeVisible();
  });

  test('should have back button on OTP screen', async ({ page }) => {
    await page.goto('/signup');
    
    const phoneInput = page.locator('input[type="tel"]');
    await phoneInput.fill('9876543210');
    
    const consentCheckbox = page.locator('input[type="checkbox"]');
    await consentCheckbox.check();
    
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    
    await page.waitForTimeout(1500);
    
    const backButton = page.locator('button', { hasText: /\+91/ });
    await expect(backButton).toBeVisible();
  });
});
