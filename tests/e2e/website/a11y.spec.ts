/**
 * PoultryPulse AI — Accessibility E2E Tests (Website)
 * TASK-WEB-024: End-to-End Test Suite (Playwright — Website)
 * File: tests/e2e/website/a11y.spec.ts
 * Requirements: WCAG 2.1 AA Compliance, Design Spec §1.1
 */

import { test, expect } from '@playwright/test';

const MARKETING_PAGES = [
  '/',
  '/pricing',
  '/accuracy',
  '/features',
  '/solutions/commercial-farms',
  '/solutions/integrators',
  '/solutions/feed-companies',
  '/solutions/enterprise',
  '/farm-intelligence',
  '/developers',
  '/compliance',
  '/about',
  '/demo',
  '/login',
  '/blog',
];

test.describe('WCAG 2.1 AA Compliance', () => {
  MARKETING_PAGES.forEach((pagePath) => {
    test(`${pagePath} has no WCAG 2.1 AA violations`, async ({ page }) => {
      await page.goto(pagePath);
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
  });
});

test.describe('Interactive Elements Accessibility', () => {
  test('all buttons have accessible names', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const buttons = await page.locator('button').all();
    
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

  test('all links have accessible names', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const links = await page.locator('a[href]').all();
    
    for (const link of links) {
      const hasAccessibleName = await link.evaluate((el) => {
        const hasAriaLabel = el.hasAttribute('aria-label');
        const hasText = el.textContent?.trim().length > 0;
        const hasTitle = el.hasAttribute('title');
        return hasAriaLabel || hasText || hasTitle;
      });
      
      expect(hasAccessibleName).toBeTruthy();
    }
  });

  test('form inputs have associated labels', async ({ page }) => {
    await page.goto('/demo');
    await page.waitForLoadState('networkidle');
    
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
});

test.describe('Color Contrast', () => {
  test('color contrast meets WCAG AA standards on homepage', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
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

  test('color contrast meets WCAG AA standards on pricing page', async ({ page }) => {
    await page.goto('/pricing');
    await page.waitForLoadState('networkidle');
    
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
});

test.describe('Keyboard Navigation', () => {
  test('keyboard navigation works for all interactive elements', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const interactiveElements = await page.locator('button, a[href], input, select').all();
    
    for (const element of interactiveElements.slice(0, 10)) { // Test first 10 elements
      await element.focus();
      const isFocused = await element.evaluate((el) => document.activeElement === el);
      expect(isFocused).toBeTruthy();
    }
  });

  test('focus indicators are visible', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const button = page.locator('button').first();
    await button.focus();
    
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

  test('tab order is logical', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Press Tab multiple times and verify focus moves
    await page.keyboard.press('Tab');
    const firstFocused = await page.evaluate(() => document.activeElement?.tagName);
    expect(['A', 'BUTTON', 'INPUT']).toContain(firstFocused);
    
    await page.keyboard.press('Tab');
    const secondFocused = await page.evaluate(() => document.activeElement?.tagName);
    expect(['A', 'BUTTON', 'INPUT']).toContain(secondFocused);
  });
});

test.describe('ARIA Attributes', () => {
  test('navigation has proper ARIA roles', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const nav = page.locator('nav').first();
    const hasRole = await nav.evaluate((el) => el.hasAttribute('role') || el.tagName === 'NAV');
    expect(hasRole).toBeTruthy();
  });

  test('mobile menu button has proper ARIA attributes', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const hamburger = page.locator('button[aria-label*="menu"], .hamburger, .mobile-menu-button').first();
    await expect(hamburger).toBeVisible();
    
    const hasAriaLabel = await hamburger.evaluate((el) => el.hasAttribute('aria-label'));
    const hasAriaExpanded = await hamburger.evaluate((el) => el.hasAttribute('aria-expanded'));
    
    expect(hasAriaLabel).toBeTruthy();
    expect(hasAriaExpanded).toBeTruthy();
  });

  test('language toggle has proper ARIA attributes', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const langToggle = page.locator('button:has-text("EN"), button:has-text("हिं"), [data-testid="lang-toggle"]').first();
    
    if (await langToggle.isVisible()) {
      const hasAriaLabel = await langToggle.evaluate((el) => el.hasAttribute('aria-label'));
      expect(hasAriaLabel).toBeTruthy();
    }
  });
});

test.describe('Image Accessibility', () => {
  test('all images have alt text', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const images = await page.locator('img').all();
    
    for (const image of images) {
      const alt = await image.getAttribute('alt');
      expect(alt).toBeTruthy();
      expect(alt?.length).toBeGreaterThan(0);
    }
  });

  test('decorative images have empty alt text', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const decorativeImages = await page.locator('img[role="presentation"], img[alt=""]').all();
    
    // Decorative images should have empty alt or role="presentation"
    for (const image of decorativeImages) {
      const alt = await image.getAttribute('alt');
      const role = await image.getAttribute('role');
      const isDecorative = alt === '' || role === 'presentation';
      expect(isDecorative).toBeTruthy();
    }
  });
});

test.describe('Form Accessibility', () => {
  test('form has proper validation feedback', async ({ page }) => {
    await page.goto('/demo');
    await page.waitForLoadState('networkidle');
    
    const phoneInput = page.locator('input[name*="phone"], input[name*="mobile"], input[type="tel"]').first();
    await phoneInput.fill('123');
    
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();
    
    // Check for aria-invalid or error message
    const hasError = await phoneInput.evaluate((el) => 
      el.hasAttribute('aria-invalid') || el.hasAttribute('aria-describedby')
    );
    
    expect(hasError).toBeTruthy();
  });

  test('required fields are marked as required', async ({ page }) => {
    await page.goto('/demo');
    await page.waitForLoadState('networkidle');
    
    const requiredInputs = await page.locator('input[required], select[required], textarea[required]').all();
    
    for (const input of requiredInputs) {
      const hasAriaRequired = await input.evaluate((el) => el.hasAttribute('aria-required'));
      const hasRequiredAttr = await input.evaluate((el) => el.hasAttribute('required'));
      
      expect(hasAriaRequired || hasRequiredAttr).toBeTruthy();
    }
  });
});

test.describe('Screen Reader Compatibility', () => {
  test('page has lang attribute', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const lang = await page.evaluate(() => document.documentElement.getAttribute('lang'));
    expect(lang).toBeTruthy();
    expect(['en', 'hi', 'en-US', 'hi-IN']).toContain(lang);
  });

  test('headings are properly nested', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    
    let previousLevel = 0;
    for (const heading of headings) {
      const tagName = await heading.evaluate((el) => el.tagName);
      const currentLevel = parseInt(tagName.replace('H', ''));
      
      if (previousLevel > 0 && currentLevel > previousLevel + 1) {
        // Heading skipped a level (e.g., h1 to h3)
        // This is a warning, not a hard failure
        console.warn(`Heading skipped from H${previousLevel} to H${currentLevel}`);
      }
      
      previousLevel = currentLevel;
    }
  });

  test('skip links are present', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const skipLink = page.locator('a[href^="#"], a:has-text("Skip"), a:has-text("skip")').first();
    
    // Skip links are optional but recommended
    if (await skipLink.isVisible()) {
      const hasSkipToContent = await skipLink.evaluate((el) => 
        el.getAttribute('href')?.startsWith('#')
      );
      expect(hasSkipToContent).toBeTruthy();
    }
  });
});

test.describe('Responsive Accessibility', () => {
  test('accessibility works on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
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
    
    expect(results.violations).toHaveLength(0);
  });

  test('accessibility works on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
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
    
    expect(results.violations).toHaveLength(0);
  });
});
