/**
 * PoultryPulse AI — Access Control E2E Tests
 * TASK-027: End-to-End Test Suite
 * File: tests/e2e/accessControl.spec.ts
 */

import { test, expect } from '@playwright/test';

test.describe('Access Control', () => {
  test('Non-admin cannot access accuracy page', async ({ page }) => {
    // Navigate as non-admin user
    await page.goto('/dashboard/admin-accuracy');
    
    // Should redirect to overview or show unauthorized
    await expect(page).toHaveURL(/overview/);
  });

  test('Non-enterprise cannot access API console', async ({ page }) => {
    // Navigate as non-enterprise user
    await page.goto('/dashboard/api-console');
    
    // Should redirect to overview or show unauthorized
    await expect(page).toHaveURL(/overview/);
  });

  test('Admin can access accuracy page', async ({ page, context }) => {
    // Set admin role in localStorage (simulating admin session)
    await context.addInitScript(() => {
      localStorage.setItem('user_role', 'admin');
    });

    await page.goto('/dashboard/admin-accuracy');
    
    // Should successfully load
    await expect(page.locator('[data-testid="accuracy-page"]')).toBeVisible();
  });

  test('Enterprise can access API console', async ({ page, context }) => {
    // Set enterprise role in localStorage (simulating enterprise session)
    await context.addInitScript(() => {
      localStorage.setItem('user_role', 'enterprise');
      localStorage.setItem('subscription_tier', 'PULSE_INTEL');
    });

    await page.goto('/dashboard/api-console');
    
    // Should successfully load
    await expect(page.locator('[data-testid="api-console"]')).toBeVisible();
  });

  test('Protected routes redirect to login when not authenticated', async ({ page, context }) => {
    // Clear any auth state
    await context.clearCookies();
    
    // Try to access protected route
    await page.goto('/dashboard/overview');
    
    // Should redirect to login
    await expect(page).toHaveURL(/login/);
  });

  test('Sidebar respects user role permissions', async ({ page, context }) => {
    // Set regular user role
    await context.addInitScript(() => {
      localStorage.setItem('user_role', 'user');
    });

    await page.goto('/dashboard/overview');
    await page.waitForLoadState('networkidle');

    // Admin-only links should not be visible
    const adminLink = page.locator('a[href="/dashboard/admin-accuracy"]');
    await expect(adminLink).not.toBeVisible();
  });
});
