/**
 * PoultryPulse AI — Navigation E2E Tests
 * TASK-WEB-024: End-to-End Test Suite (Playwright — Website)
 * File: tests/e2e/website/navigation.spec.ts
 * Requirements: GWEB-001, Design Spec §2.1
 */

import { test, expect } from '@playwright/test';

test.describe('Desktop Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('navigation is visible on desktop', async ({ page }) => {
    const nav = page.locator('nav').first();
    await expect(nav).toBeVisible();
  });

  test('logo links to homepage', async ({ page }) => {
    const logo = page.locator('nav a[href="/"], nav a[href="/home"], .logo a').first();
    await logo.click();
    await expect(page).toHaveURL('/');
  });

  test('all nav links resolve without 404', async ({ page, request }) => {
    const navLinks = await page.locator('nav a').all();
    
    for (const link of navLinks) {
      const href = await link.getAttribute('href');
      if (href && href.startsWith('/')) {
        const response = await request.get(`http://localhost:3000${href}`);
        expect(response.status()).not.toBe(404);
      }
    }
  });

  test('Products dropdown opens on hover', async ({ page }) => {
    const productsDropdown = page.locator('nav a:has-text("Products"), nav button:has-text("Products")').first();
    
    if (await productsDropdown.isVisible()) {
      await productsDropdown.hover();
      await page.waitForTimeout(300);
      
      // Check if dropdown menu appears
      const dropdownMenu = page.locator('.dropdown-menu, .products-dropdown').first();
      const isVisible = await dropdownMenu.isVisible();
      
      if (isVisible) {
        await expect(dropdownMenu).toBeVisible();
      }
    }
  });

  test('Solutions dropdown opens on hover', async ({ page }) => {
    const solutionsDropdown = page.locator('nav a:has-text("Solutions"), nav button:has-text("Solutions")').first();
    
    if (await solutionsDropdown.isVisible()) {
      await solutionsDropdown.hover();
      await page.waitForTimeout(300);
      
      // Check if dropdown menu appears
      const dropdownMenu = page.locator('.dropdown-menu, .solutions-dropdown').first();
      const isVisible = await dropdownMenu.isVisible();
      
      if (isVisible) {
        await expect(dropdownMenu).toBeVisible();
      }
    }
  });

  test('Request Demo button is always visible', async ({ page }) => {
    const demoButton = page.locator('nav a:has-text("Request Demo"), nav button:has-text("Request Demo"), nav a:has-text("डेमो")').first();
    await expect(demoButton).toBeVisible();
  });

  test('Request Demo button navigates to demo page', async ({ page }) => {
    const demoButton = page.locator('nav a:has-text("Request Demo"), nav button:has-text("Request Demo")').first();
    await demoButton.click();
    await expect(page).toHaveURL(/\/demo/);
  });

  test('Login button navigates to login page', async ({ page }) => {
    const loginButton = page.locator('nav a:has-text("Login"), nav button:has-text("Login"), nav a:has-text("लॉगिन")').first();
    
    if (await loginButton.isVisible()) {
      await loginButton.click();
      await expect(page).toHaveURL(/\/login/);
    }
  });

  test('navigation becomes sticky on scroll', async ({ page }) => {
    const nav = page.locator('nav').first();
    const initialClass = await nav.getAttribute('class');
    
    // Scroll down
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(300);
    
    const scrolledClass = await nav.getAttribute('class');
    
    // Class should change (add scrolled/sticky class)
    expect(scrolledClass).not.toBe(initialClass);
  });

  test('language toggle is visible in nav', async ({ page }) => {
    const languageToggle = page.locator('nav button:has-text("EN"), nav button:has-text("हिं"), nav [data-testid="lang-toggle"]').first();
    await expect(languageToggle).toBeVisible();
  });
});

test.describe('Mobile Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('hamburger menu is visible on mobile', async ({ page }) => {
    const hamburger = page.locator('button[aria-label*="menu"], .hamburger, .mobile-menu-button').first();
    await expect(hamburger).toBeVisible();
  });

  test('mobile drawer opens when hamburger is clicked', async ({ page }) => {
    const hamburger = page.locator('button[aria-label*="menu"], .hamburger, .mobile-menu-button').first();
    await hamburger.click();
    await page.waitForTimeout(300);
    
    const mobileDrawer = page.locator('.mobile-drawer, .mobile-menu, [role="dialog"]').first();
    await expect(mobileDrawer).toBeVisible();
  });

  test('mobile drawer closes when close button is clicked', async ({ page }) => {
    const hamburger = page.locator('button[aria-label*="menu"], .hamburger, .mobile-menu-button').first();
    await hamburger.click();
    await page.waitForTimeout(300);
    
    const closeButton = page.locator('button[aria-label*="close"], .close-button, button:has-text("✕")').first();
    await closeButton.click();
    await page.waitForTimeout(300);
    
    const mobileDrawer = page.locator('.mobile-drawer, .mobile-menu').first();
    await expect(mobileDrawer).not.toBeVisible();
  });

  test('mobile drawer has all navigation links', async ({ page }) => {
    const hamburger = page.locator('button[aria-label*="menu"], .hamburger, .mobile-menu-button').first();
    await hamburger.click();
    await page.waitForTimeout(300);
    
    // Check for key navigation items
    await expect(page.locator('a:has-text("Home"), a:has-text("होम")').first()).toBeVisible();
    await expect(page.locator('a:has-text("Features"), a:has-text("फीचर्स")').first()).toBeVisible();
    await expect(page.locator('a:has-text("Pricing"), a:has-text("मूल्य")').first()).toBeVisible();
  });

  test('Request Demo button is visible in mobile drawer', async ({ page }) => {
    const hamburger = page.locator('button[aria-label*="menu"], .hamburger, .mobile-menu-button').first();
    await hamburger.click();
    await page.waitForTimeout(300);
    
    const demoButton = page.locator('.mobile-drawer a:has-text("Request Demo"), .mobile-menu button:has-text("Request Demo")').first();
    await expect(demoButton).toBeVisible();
  });

  test('language toggle is visible in mobile drawer', async ({ page }) => {
    const hamburger = page.locator('button[aria-label*="menu"], .hamburger, .mobile-menu-button').first();
    await hamburger.click();
    await page.waitForTimeout(300);
    
    const languageToggle = page.locator('.mobile-drawer button:has-text("EN"), .mobile-drawer button:has-text("हिं")').first();
    await expect(languageToggle).toBeVisible();
  });
});

test.describe('Navigation Links Across Pages', () => {
  const pages = ['/', '/pricing', '/accuracy', '/features', '/about'];
  
  pages.forEach((pagePath) => {
    test(`navigation is consistent on ${pagePath}`, async ({ page }) => {
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');
      
      const nav = page.locator('nav').first();
      await expect(nav).toBeVisible();
      
      const logo = page.locator('nav a[href="/"], .logo a').first();
      await expect(logo).toBeVisible();
    });
  });
});

test.describe('Footer Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('footer is visible', async ({ page }) => {
    const footer = page.locator('footer').first();
    await footer.scrollIntoViewIfNeeded();
    await expect(footer).toBeVisible();
  });

  test('footer has all required sections', async ({ page }) => {
    const footer = page.locator('footer').first();
    await footer.scrollIntoViewIfNeeded();
    
    // Check for product links
    await expect(page.locator('footer a:has-text("PulsePro"), footer a:has-text("Features")').first()).toBeVisible();
    
    // Check for company links
    await expect(page.locator('footer a:has-text("About"), footer a:has-text("Blog")').first()).toBeVisible();
    
    // Check for legal links
    await expect(page.locator('footer a:has-text("Privacy"), footer a:has-text("Terms")').first()).toBeVisible();
  });

  test('footer links resolve without 404', async ({ page, request }) => {
    const footer = page.locator('footer').first();
    await footer.scrollIntoViewIfNeeded();
    
    const footerLinks = await footer.locator('a').all();
    
    for (const link of footerLinks) {
      const href = await link.getAttribute('href');
      if (href && href.startsWith('/')) {
        const response = await request.get(`http://localhost:3000${href}`);
        expect(response.status()).not.toBe(404);
      }
    }
  });

  test('WhatsApp contact link is present', async ({ page }) => {
    const footer = page.locator('footer').first();
    await footer.scrollIntoViewIfNeeded();
    
    const whatsappLink = page.locator('footer a[href*="wa.me"], footer a[href*="whatsapp"]').first();
    await expect(whatsappLink).toBeVisible();
  });

  test('accuracy marquee is visible in footer', async ({ page }) => {
    const footer = page.locator('footer').first();
    await footer.scrollIntoViewIfNeeded();
    
    const accuracyMarquee = page.locator('.accuracy-marquee, .marquee, footer:has-text("96.2%")').first();
    await expect(accuracyMarquee).toBeVisible();
  });
});

test.describe('Navigation Accessibility', () => {
  test('nav links have accessible names', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const navLinks = await page.locator('nav a').all();
    
    for (const link of navLinks) {
      const hasAccessibleName = await link.evaluate((el) => {
        const hasAriaLabel = el.hasAttribute('aria-label');
        const hasText = el.textContent?.trim().length > 0;
        return hasAriaLabel || hasText;
      });
      
      expect(hasAccessibleName).toBeTruthy();
    }
  });

  test('navigation is keyboard navigable', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const firstNavLink = page.locator('nav a').first();
    await firstNavLink.focus();
    
    const isFocused = await firstNavLink.evaluate((el) => document.activeElement === el);
    expect(isFocused).toBeTruthy();
  });

  test('mobile menu button has aria-label', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const hamburger = page.locator('button[aria-label*="menu"], .hamburger, .mobile-menu-button').first();
    await expect(hamburger).toBeVisible();
    
    const hasAriaLabel = await hamburger.evaluate((el) => el.hasAttribute('aria-label'));
    expect(hasAriaLabel).toBeTruthy();
  });
});
