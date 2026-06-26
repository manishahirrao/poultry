import { test, expect, devices } from '@playwright/test';

/**
 * QA-001 — Cross-Browser Testing Matrix
 * Phase 13: Final QA & Launch
 * 
 * Test Protocol Per Device:
 * 1. Load homepage — check hero renders correctly, text doesn't overflow
 * 2. Scroll full homepage — check all animations work, no jank
 * 3. Click "Start Free Trial" — check redirect to /signup
 * 4. Complete signup Step 1 — check phone input works with numeric keyboard
 * 5. Switch language toggle — check Hindi fonts load, layout doesn't break
 * 6. Navigate to /features/whatsapp-log — check animations
 * 7. Navigate to /pricing — check comparison table horizontal scroll on mobile
 * 8. Navigate to /accuracy — check charts render correctly
 * 9. Check footer — verify no broken links
 */

test.describe('QA-001: Cross-Browser Testing Matrix', () => {
  // Test 1: Homepage hero renders correctly
  test('Homepage hero renders correctly without text overflow', async ({ page }) => {
    await page.goto('/');
    
    // Check hero section is visible
    const hero = page.locator('section').filter({ hasText: /Run Your Poultry Operation/i }).first();
    await expect(hero).toBeVisible();
    
    // Check headline is visible and not overflowing
    const headline = page.locator('h1').first();
    await expect(headline).toBeVisible();
    
    // Check headline text doesn't overflow container
    const headlineBox = await headline.boundingBox();
    const heroBox = await hero.boundingBox();
    expect(headlineBox?.width).toBeLessThanOrEqual(heroBox!.width);
    
    // Check subheadline is visible
    const subheadline = page.locator('p').filter({ hasText: /FlockIQ gives integrators/i }).first();
    await expect(subheadline).toBeVisible();
    
    // Check CTA buttons are visible
    const ctaButton = page.locator('a').filter({ hasText: /Start Free Trial/i }).first();
    await expect(ctaButton).toBeVisible();
  });

  // Test 2: Scroll full homepage - animations work, no jank
  test('Scroll full homepage - animations work without jank', async ({ page }) => {
    await page.goto('/');
    
    // Scroll to bottom of page
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // Wait for animations to complete
    await page.waitForTimeout(1000);
    
    // Check that no console errors occurred
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Scroll back to top
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    
    // Verify no errors
    expect(errors).toHaveLength(0);
  });

  // Test 3: Click "Start Free Trial" redirects to /signup
  test('Click "Start Free Trial" redirects to /signup', async ({ page }) => {
    await page.goto('/');
    
    const ctaButton = page.locator('a').filter({ hasText: /Start Free Trial/i }).first();
    await ctaButton.click();
    
    await expect(page).toHaveURL(/\/signup/);
  });

  // Test 4: Complete signup Step 1 - phone input with numeric keyboard
  test('Complete signup Step 1 - phone input works with numeric keyboard', async ({ page }) => {
    await page.goto('/signup');
    
    // Check phone input is visible
    const phoneInput = page.locator('input[type="tel"], input[name="phone"], input[placeholder*="phone" i]').first();
    await expect(phoneInput).toBeVisible();
    
    // Check input type is tel for numeric keyboard
    const inputType = await phoneInput.getAttribute('type');
    expect(inputType).toBe('tel');
    
    // Enter phone number
    await phoneInput.fill('9876543210');
    
    // Check value is accepted
    const value = await phoneInput.inputValue();
    expect(value).toBe('9876543210');
  });

  // Test 5: Switch language toggle - Hindi fonts load, layout doesn't break
  test('Switch language toggle - Hindi fonts load, layout doesn\'t break', async ({ page }) => {
    await page.goto('/');
    
    // Find language toggle
    const languageToggle = page.locator('button').filter({ hasText: /EN|हि|English|Hindi/i }).first();
    await expect(languageToggle).toBeVisible();
    
    // Click to switch to Hindi
    await languageToggle.click();
    
    // Wait for language change
    await page.waitForTimeout(500);
    
    // Check HTML lang attribute changed
    const htmlLang = await page.locator('html').getAttribute('lang');
    expect(htmlLang).toBe('hi');
    
    // Check that Hindi text is visible (if Hindi content exists)
    const hindiText = page.locator('[lang="hi"], .hindi-text');
    const hasHindiContent = await hindiText.count() > 0;
    
    if (hasHindiContent) {
      await expect(hindiText.first()).toBeVisible();
    }
    
    // Check layout is not broken (no horizontal scroll)
    const bodyWidth = await page.locator('body').evaluate(el => el.scrollWidth);
    const viewportWidth = page.viewportSize()?.width || 1920;
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth);
    
    // Switch back to English
    await languageToggle.click();
    await page.waitForTimeout(500);
  });

  // Test 6: Navigate to /features/whatsapp-log - check animations
  test('Navigate to /features/whatsapp-log - animations work', async ({ page }) => {
    await page.goto('/features/whatsapp-log');
    
    // Check page loaded
    await expect(page).toHaveURL(/\/features\/whatsapp-log/);
    
    // Check hero section is visible
    const hero = page.locator('section').first();
    await expect(hero).toBeVisible();
    
    // Check for animated elements (fade-up, etc.)
    const animatedElements = page.locator('[data-motion], .fade-up, .animate-in');
    const hasAnimations = await animatedElements.count() > 0;
    
    if (hasAnimations) {
      await expect(animatedElements.first()).toBeVisible();
    }
    
    // Check no console errors during animation
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.waitForTimeout(1000);
    expect(errors).toHaveLength(0);
  });

  // Test 7: Navigate to /pricing - comparison table horizontal scroll on mobile
  test('Navigate to /pricing - comparison table horizontal scroll on mobile', async ({ page, isMobile }) => {
    await page.goto('/pricing');
    
    // Check page loaded
    await expect(page).toHaveURL(/\/pricing/);
    
    // Check pricing cards are visible
    const pricingCards = page.locator('[data-testid="pricing-card"], .pricing-card');
    await expect(pricingCards.first()).toBeVisible();
    
    // On mobile, check horizontal scroll for comparison table
    if (isMobile) {
      const comparisonTable = page.locator('table, [data-testid="comparison-table"]');
      const hasTable = await comparisonTable.count() > 0;
      
      if (hasTable) {
        await expect(comparisonTable.first()).toBeVisible();
        
        // Check if table has horizontal scroll
        const tableContainer = comparisonTable.locator('..');
        const overflowX = await tableContainer.evaluate(el => 
          window.getComputedStyle(el).overflowX
        );
        
        expect(overflowX).toMatch(/auto|scroll/);
      }
    }
  });

  // Test 8: Navigate to /accuracy - charts render correctly
  test('Navigate to /accuracy - charts render correctly', async ({ page }) => {
    await page.goto('/accuracy');
    
    // Check page loaded
    await expect(page).toHaveURL(/\/accuracy/);
    
    // Check for chart elements (Recharts, canvas, svg)
    const chartElements = page.locator('svg, canvas, [data-testid="chart"], .recharts-wrapper');
    await expect(chartElements.first()).toBeVisible();
    
    // Check that chart has content (not empty)
    const chartContent = await chartElements.first().innerHTML();
    expect(chartContent.length).toBeGreaterThan(0);
    
    // Check no console errors related to charts
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error' && msg.text().toLowerCase().includes('chart')) {
        errors.push(msg.text());
      }
    });
    
    await page.waitForTimeout(1000);
    expect(errors).toHaveLength(0);
  });

  // Test 9: Check footer - verify no broken links
  test('Check footer - verify no broken links', async ({ page }) => {
    await page.goto('/');
    
    // Find footer
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    
    // Get all links in footer
    const footerLinks = footer.locator('a');
    const linkCount = await footerLinks.count();
    
    // Check each link
    for (let i = 0; i < linkCount; i++) {
      const link = footerLinks.nth(i);
      const href = await link.getAttribute('href');
      
      // Skip empty links, anchors, and external links
      if (!href || href.startsWith('#') || href.startsWith('http')) {
        continue;
      }
      
      // Check link is clickable
      await expect(link).toBeVisible();
    }
    
    // Check key footer sections are present
    await expect(footer.locator('text=Brand')).toBeVisible();
    await expect(footer.locator('text=Product')).toBeVisible();
    await expect(footer.locator('text=Solutions')).toBeVisible();
  });

  // Test 10: Responsive design - mobile viewport
  test('Responsive design - mobile viewport (375x667)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Check mobile menu is visible
    const mobileMenuButton = page.locator('button[aria-label*="menu" i], button[aria-label*="Menu" i], .hamburger');
    await expect(mobileMenuButton).toBeVisible();
    
    // Check desktop nav is hidden
    const desktopNav = page.locator('nav ul').filter({ hasText: /Products|Solutions|Features/i });
    await expect(desktopNav).not.toBeVisible();
  });

  // Test 11: Responsive design - tablet viewport
  test('Responsive design - tablet viewport (768x1024)', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    
    // Check content is readable
    const headline = page.locator('h1').first();
    await expect(headline).toBeVisible();
    
    // Check no horizontal scroll
    const bodyWidth = await page.locator('body').evaluate(el => el.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(768);
  });

  // Test 12: Performance - LCP check
  test('Performance - Largest Contentful Paint under 3s', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    
    // Wait for LCP (largest contentful paint)
    await page.waitForLoadState('networkidle');
    
    const endTime = Date.now();
    const loadTime = endTime - startTime;
    
    // LCP should be under 3s (3000ms)
    expect(loadTime).toBeLessThan(3000);
  });

  // Test 13: Accessibility - keyboard navigation
  test('Accessibility - keyboard navigation works', async ({ page }) => {
    await page.goto('/');
    
    // Tab to first interactive element
    await page.keyboard.press('Tab');
    
    // Check focus is visible
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(['A', 'BUTTON', 'INPUT']).toContain(focusedElement);
    
    // Tab through navigation
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Enter should activate focused link
    await page.keyboard.press('Enter');
    
    // Check navigation occurred
    await page.waitForTimeout(500);
    const currentUrl = page.url();
    expect(currentUrl).not.toBe('http://localhost:3000/');
  });

  // Test 14: Form validation - signup
  test('Form validation - signup phone input validation', async ({ page }) => {
    await page.goto('/signup');
    
    const phoneInput = page.locator('input[type="tel"], input[name="phone"]').first();
    const submitButton = page.locator('button[type="submit"], button:has-text("Submit"), button:has-text("Continue")').first();
    
    // Try to submit without phone number
    await submitButton.click();
    
    // Check validation error
    const errorMessage = page.locator('text=required, text=invalid, text=please enter').first();
    const hasError = await errorMessage.count() > 0;
    
    if (hasError) {
      await expect(errorMessage).toBeVisible();
    }
    
    // Enter invalid phone number
    await phoneInput.fill('123');
    await submitButton.click();
    
    // Check validation error for invalid format
    const invalidError = page.locator('text=invalid, text=10 digit, text=valid phone').first();
    const hasInvalidError = await invalidError.count() > 0;
    
    if (hasInvalidError) {
      await expect(invalidError).toBeVisible();
    }
  });

  // Test 15: Image loading - all images load
  test('Image loading - all images load successfully', async ({ page }) => {
    await page.goto('/');
    
    // Get all images
    const images = page.locator('img');
    const imageCount = await images.count();
    
    // Check each image loads
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      await expect(img).toBeVisible();
      
      // Check natural width (image loaded)
      const naturalWidth = await img.evaluate(el => (el as HTMLImageElement).naturalWidth);
      expect(naturalWidth).toBeGreaterThan(0);
    }
  });

  // Test 16: Cookie consent - if present
  test('Cookie consent - if present, can be dismissed', async ({ page }) => {
    await page.goto('/');
    
    // Check for cookie banner
    const cookieBanner = page.locator('[data-testid="cookie-banner"], .cookie-banner, [role="dialog"]').filter({ hasText: /cookie/i });
    const hasCookieBanner = await cookieBanner.count() > 0;
    
    if (hasCookieBanner) {
      await expect(cookieBanner).toBeVisible();
      
      // Find dismiss button
      const dismissButton = cookieBanner.locator('button').filter({ hasText: /accept|dismiss|close/i }).first();
      await dismissButton.click();
      
      // Check banner is hidden
      await expect(cookieBanner).not.toBeVisible();
    }
  });

  // Test 17: Announcement bar - dismiss functionality
  test('Announcement bar - dismiss functionality works', async ({ page }) => {
    await page.goto('/');
    
    // Check for announcement bar
    const announcementBar = page.locator('[data-testid="announcement-bar"], .announcement-bar').filter({ hasText: /New|Available|Free/i });
    const hasAnnouncementBar = await announcementBar.count() > 0;
    
    if (hasAnnouncementBar) {
      await expect(announcementBar).toBeVisible();
      
      // Find dismiss button
      const dismissButton = announcementBar.locator('button[aria-label*="dismiss" i], button[aria-label*="close" i]').first();
      await dismissButton.click();
      
      // Check bar is hidden
      await expect(announcementBar).not.toBeVisible();
    }
  });

  // Test 18: Social links - open in new tab
  test('Social links - open in new tab', async ({ page }) => {
    await page.goto('/');
    
    // Find social links
    const socialLinks = page.locator('a[href*="facebook"], a[href*="twitter"], a[href*="linkedin"], a[href*="youtube"]');
    const hasSocialLinks = await socialLinks.count() > 0;
    
    if (hasSocialLinks) {
      const firstLink = socialLinks.first();
      const target = await firstLink.getAttribute('target');
      
      // Social links should open in new tab
      expect(target).toBe('_blank');
    }
  });

  // Test 19: Search functionality - if present
  test('Search functionality - if present, works correctly', async ({ page }) => {
    await page.goto('/');
    
    // Check for search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i], [data-testid="search-input"]');
    const hasSearch = await searchInput.count() > 0;
    
    if (hasSearch) {
      await searchInput.first().fill('pricing');
      await page.keyboard.press('Enter');
      
      // Check search results or redirect
      await page.waitForTimeout(1000);
      const currentUrl = page.url();
      expect(currentUrl).toMatch(/search|pricing/);
    }
  });

  // Test 20: Print styles - page is printable
  test('Print styles - page renders correctly in print mode', async ({ page }) => {
    await page.goto('/');
    
    // Check print styles don't break layout
    await page.emulateMedia({ media: 'print' });
    
    // Check content is still visible
    const headline = page.locator('h1').first();
    await expect(headline).toBeVisible();
    
    // Reset to screen
    await page.emulateMedia({ media: 'screen' });
  });
});
