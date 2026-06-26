/**
 * PoultryPulse AI — Accessibility E2E Tests
 * TASK-027: End-to-End Test Suite
 * File: tests/e2e/accessibility.spec.ts
 */

import { test, expect } from '@playwright/test';

test.describe('Accessibility (WCAG 2.1 AA)', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
  });

  test('Command Center has no WCAG 2.1 AA violations', async ({ page }) => {
    // Inject axe-core
    await page.addScriptTag({
      url: 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.8.2/axe.min.js',
    });

    // Run axe-core audit
    const results = await page.evaluate(async () => {
      return await (window as any).axe.run(document, {
        runOnly: {
          type: 'tag',
          values: ['wcag2aa'],
        },
      });
    });

    // Assert no violations
    expect(results.violations).toHaveLength(0);
  });

  test('Batch Optimizer has no WCAG 2.1 AA violations', async ({ page }) => {
    await page.goto('/dashboard/calculator');
    await page.waitForLoadState('networkidle');

    // Inject axe-core
    await page.addScriptTag({
      url: 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.8.2/axe.min.js',
    });

    // Run axe-core audit
    const results = await page.evaluate(async () => {
      return await (window as any).axe.run(document, {
        runOnly: {
          type: 'tag',
          values: ['wcag2aa'],
        },
      });
    });

    // Assert no violations
    expect(results.violations).toHaveLength(0);
  });

  test('Alert Feed has no WCAG 2.1 AA violations', async ({ page }) => {
    await page.goto('/dashboard/alerts');
    await page.waitForLoadState('networkidle');

    // Inject axe-core
    await page.addScriptTag({
      url: 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.8.2/axe.min.js',
    });

    // Run axe-core audit
    const results = await page.evaluate(async () => {
      return await (window as any).axe.run(document, {
        runOnly: {
          type: 'tag',
          values: ['wcag2aa'],
        },
      });
    });

    // Assert no violations
    expect(results.violations).toHaveLength(0);
  });

  test('All interactive elements have accessible names', async ({ page }) => {
    // Get all buttons and links
    const buttons = await page.locator('button, a[href]').all();
    
    for (const button of buttons) {
      const hasAccessibleName = await button.evaluate((el) => {
        const hasAriaLabel = el.hasAttribute('aria-label');
        const hasText = el.textContent?.trim().length > 0;
        const hasTitle = el.hasAttribute('title');
        return hasAriaLabel || hasText || hasTitle;
      });
      
      expect(hasAccessibleName).toBeTruthy();
    }
  });

  test('Form inputs have associated labels', async ({ page }) => {
    await page.goto('/dashboard/calculator');
    await page.waitForLoadState('networkidle');

    // Get all form inputs
    const inputs = await page.locator('input, select, textarea').all();
    
    for (const input of inputs) {
      const hasLabel = await input.evaluate((el) => {
        const hasAriaLabel = el.hasAttribute('aria-label');
        const hasAriaLabelledby = el.hasAttribute('aria-labelledby');
        const hasId = el.hasAttribute('id');
        
        if (hasId) {
          const label = document.querySelector(`label[for="${el.id}"]`);
          if (label) return true;
        }
        
        return hasAriaLabel || hasAriaLabelledby;
      });
      
      expect(hasLabel).toBeTruthy();
    }
  });

  test('Color contrast meets WCAG AA standards', async ({ page }) => {
    // Inject axe-core
    await page.addScriptTag({
      url: 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.8.2/axe.min.js',
    });

    // Run color contrast audit
    const results = await page.evaluate(async () => {
      return await (window as any).axe.run(document, {
        runOnly: {
          type: 'tag',
          values: ['wcag2aa'],
        },
        rules: {
          'color-contrast': { enabled: true },
        },
      });
    });

    // Assert no color contrast violations
    const contrastViolations = results.violations.filter(
      (v: any) => v.id === 'color-contrast'
    );
    expect(contrastViolations).toHaveLength(0);
  });

  test('Keyboard navigation works for all interactive elements', async ({ page }) => {
    // Tab through interactive elements
    const interactiveElements = await page.locator('button, a[href], input, select').all();
    
    for (const element of interactiveElements) {
      await element.focus();
      const isFocused = await element.evaluate((el) => document.activeElement === el);
      expect(isFocused).toBeTruthy();
    }
  });

  test('Focus indicators are visible', async ({ page }) => {
    // Get a button and focus it
    const button = page.locator('button').first();
    await button.focus();
    
    // Check for visible focus indicator
    const hasFocusStyle = await button.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return (
        styles.outline !== 'none' ||
        styles.boxShadow !== 'none' ||
        styles.border.includes('focus')
      );
    });
    
    expect(hasFocusStyle).toBeTruthy();
  });
});
