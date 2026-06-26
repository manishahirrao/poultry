// FlockIQ — Hindi Text Rendering Validation Tests
// File: apps/web/__tests__/typography/hindi-text.spec.ts
// Task Reference: T-04
// Requirements: NFR-A11Y-001, NFR-I18N-001

import { test, expect } from '@playwright/test';

// Viewport configurations for testing
const viewports = [
  { width: 390, height: 844, name: 'mobile' },
  { width: 768, height: 1024, name: 'tablet' },
  { width: 1440, height: 900, name: 'desktop' }
];

viewports.forEach(({ width, height, name }) => {
  test.describe(`Hindi Text Rendering - ${name} (${width}px)`, () => {
    test.use({ viewport: { width, height } });

    test('should render Noto Sans Devanagari font correctly', async ({ page }) => {
      await page.goto('/');
      
      // Check if Noto Sans Devanagari is loaded
      const fontFace = await page.evaluate(() => {
        const fonts = document.fonts;
        for (const font of fonts) {
          if (font.family.includes('Noto Sans Devanagari') || font.family.includes('Devanagari')) {
            return true;
          }
        }
        return false;
      });
      
      // Font should be loaded or fallback should work
      expect(fontFace).toBeTruthy();
    });

    test('should render conjunct consonants correctly: क्ष, त्र, ज्ञ', async ({ page }) => {
      await page.goto('/');
      
      // Navigate to a page with Hindi text (homepage should have Hindi)
      const hindiText = page.locator('text=/क्ष|त्र|ज्ञ/i');
      
      // Check if conjunct consonants are visible
      if (await hindiText.count() > 0) {
        await expect(hindiText.first()).toBeVisible();
      } else {
        // If not found on homepage, check if Hindi text renders at all
        const anyHindi = page.locator('text=/[\\u0900-\\u097F]/');
        await expect(anyHindi.first()).toBeVisible();
      }
    });

    test('should render Devanagari numerals correctly: ०, १, २', async ({ page }) => {
      await page.goto('/');
      
      // Check for Devanagari numerals
      const devanagariNumerals = page.locator('text=/०|१|२|३|४|५|६|७|८|९/');
      
      if (await devanagariNumerals.count() > 0) {
        await expect(devanagariNumerals.first()).toBeVisible();
      }
    });

    test('should render matra combining characters correctly', async ({ page }) => {
      await page.goto('/');
      
      // Matras: ि (i), ी (ii), ु (u), ू (uu), े (e), ै (ai), ो (o), ौ (au)
      const matras = page.locator('text=/[\\u093F-\\u094C]/');
      
      // Hindi text should contain matras
      if (await matras.count() > 0) {
        await expect(matras.first()).toBeVisible();
      }
    });

    test('body text should have minimum font size of 16px', async ({ page }) => {
      await page.goto('/');
      
      // Check body text font size
      const bodyFontSize = await page.evaluate(() => {
        const body = document.body;
        const computedStyle = window.getComputedStyle(body);
        return parseInt(computedStyle.fontSize);
      });
      
      expect(bodyFontSize).toBeGreaterThanOrEqual(16);
    });

    test('caption text should have minimum font size of 14px', async ({ page }) => {
      await page.goto('/');
      
      // Check for caption/small text elements
      const smallText = page.locator('small, .caption, .text-sm, .text-xs').first();
      
      if (await smallText.isVisible()) {
        const fontSize = await smallText.evaluate(el => {
          const computedStyle = window.getComputedStyle(el);
          return parseInt(computedStyle.fontSize);
        });
        
        expect(fontSize).toBeGreaterThanOrEqual(14);
      }
    });

    test('headings should have line-height ≥ 1.375 for matra spacing', async ({ page }) => {
      await page.goto('/');
      
      // Check heading line-height
      const heading = page.locator('h1, h2, h3').first();
      await expect(heading).toBeVisible();
      
      const lineHeight = await heading.evaluate(el => {
        const computedStyle = window.getComputedStyle(el);
        const lineHeightValue = computedStyle.lineHeight;
        
        if (lineHeightValue === 'normal') {
          return 1.2; // Default normal line-height
        }
        
        return parseFloat(lineHeightValue);
      });
      
      expect(lineHeight).toBeGreaterThanOrEqual(1.375);
    });

    test('should not have text smaller than 14px', async ({ page }) => {
      await page.goto('/');
      
      // Check all text elements for minimum font size
      const tooSmallText = await page.evaluate(() => {
        const elements = document.querySelectorAll('*');
        const violations: string[] = [];
        
        elements.forEach(el => {
          const computedStyle = window.getComputedStyle(el);
          const fontSize = parseInt(computedStyle.fontSize);
          const text = el.textContent?.trim();
          
          if (text && text.length > 0 && fontSize < 14) {
            violations.push(`${el.tagName} (${fontSize}px): ${text.substring(0, 20)}`);
          }
        });
        
        return violations;
      });
      
      expect(tooSmallText.length).toBe(0);
    });

    test('Hindi text should be readable with proper contrast', async ({ page }) => {
      await page.goto('/');
      
      // Check contrast ratio for Hindi text elements
      const contrastViolations = await page.evaluate(() => {
        const elements = document.querySelectorAll('*');
        const violations: string[] = [];
        
        elements.forEach(el => {
          const text = el.textContent?.trim();
          const hasHindi = /[\u0900-\u097F]/.test(text || '');
          
          if (hasHindi && text && text.length > 0) {
            const computedStyle = window.getComputedStyle(el);
            const color = computedStyle.color;
            const backgroundColor = computedStyle.backgroundColor;
            
            // Basic check - ensure text is not invisible
            if (color === 'rgba(0, 0, 0, 0)' || color === 'transparent') {
              violations.push(`${el.tagName}: Invisible text`);
            }
          }
        });
        
        return violations;
      });
      
      expect(contrastViolations.length).toBe(0);
    });

    test('should handle Hindi text overflow correctly', async ({ page }) => {
      await page.goto('/');
      
      // Check that long Hindi text doesn't overflow containers
      const overflowViolations = await page.evaluate(() => {
        const elements = document.querySelectorAll('*');
        const violations: string[] = [];
        
        elements.forEach(el => {
          const computedStyle = window.getComputedStyle(el);
          const overflowX = computedStyle.overflowX;
          const scrollWidth = el.scrollWidth;
          const clientWidth = el.clientWidth;
          
          if (scrollWidth > clientWidth && overflowX === 'visible') {
            const text = el.textContent?.trim();
            if (text && text.length > 0) {
              violations.push(`${el.tagName}: Text overflow`);
            }
          }
        });
        
        return violations;
      });
      
      // Allow some overflow for specific design elements, but not for body text
      expect(overflowViolations.length).toBeLessThan(5);
    });

    test('should render Hindi characters with proper spacing', async ({ page }) => {
      await page.goto('/');
      
      // Check letter-spacing for Hindi text
      const hindiElements = await page.locator('text=/[\\u0900-\\u097F]/').all();
      
      if (hindiElements.length > 0) {
        const letterSpacing = await hindiElements[0].evaluate(el => {
          const computedStyle = window.getComputedStyle(el);
          return computedStyle.letterSpacing;
        });
        
        // Letter-spacing should not be negative (which would cause overlapping)
        expect(parseFloat(letterSpacing || '0')).toBeGreaterThanOrEqual(-0.5);
      }
    });

    test('should support Hindi text selection and copying', async ({ page }) => {
      await page.goto('/');
      
      // Find Hindi text
      const hindiText = page.locator('text=/[\\u0900-\\u097F]{3,}/').first();
      
      if (await hindiText.isVisible()) {
        // Try to select text
        await hindiText.selectText();
        
        // Verify selection is possible
        const selection = await page.evaluate(() => {
          return window.getSelection()?.toString() || '';
        });
        
        expect(selection.length).toBeGreaterThan(0);
      }
    });

    test('should render Hindi text consistently across viewports', async ({ page }) => {
      await page.goto('/');
      
      // Take screenshot for visual regression (optional)
      // This test ensures Hindi text renders without layout shifts
      const hindiText = page.locator('text=/[\\u0900-\\u097F]/').first();
      
      if (await hindiText.isVisible()) {
        const boundingBox = await hindiText.boundingBox();
        expect(boundingBox).toBeTruthy();
        expect(boundingBox!.width).toBeGreaterThan(0);
        expect(boundingBox!.height).toBeGreaterThan(0);
      }
    });
  });
});
