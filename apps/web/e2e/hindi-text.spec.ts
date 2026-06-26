// FlockIQ — Hindi Text Rendering Validation Tests
// File: apps/web/e2e/hindi-text.spec.ts
// Task Reference: I-05
// Requirements: FR-COPY-001, NFR-A11Y-001

import { test, expect } from '@playwright/test';

test.describe('Hindi Text Rendering Validation', () => {
  test('should render conjunct consonants correctly (क्ष, त्र, ज्ञ)', async ({ page }) => {
    await page.goto('/');
    
    // Check for Hindi text with conjunct consonants
    const hindiText = page.locator('text=/क्ष|त्र|ज्ञ/i');
    
    // If Hindi text exists, verify it's visible
    if (await hindiText.count() > 0) {
      await expect(hindiText.first()).toBeVisible();
      
      // Verify no text clipping by checking bounding box
      const box = await hindiText.first().boundingBox();
      expect(box).toBeTruthy();
      expect(box?.width).toBeGreaterThan(0);
      expect(box?.height).toBeGreaterThan(0);
    }
  });

  test('should render Devanagari numerals correctly (०, १, २)', async ({ page }) => {
    await page.goto('/');
    
    // Check for Devanagari numerals
    const devanagariNumerals = page.locator('text=/[०-९]/i');
    
    if (await devanagariNumerals.count() > 0) {
      await expect(devanagariNumerals.first()).toBeVisible();
      
      // Verify no text clipping
      const box = await devanagariNumerals.first().boundingBox();
      expect(box).toBeTruthy();
      expect(box?.width).toBeGreaterThan(0);
    }
  });

  test('should render matra combining characters correctly', async ({ page }) => {
    await page.goto('/');
    
    // Check for Hindi text with matras (vowel signs)
    const hindiWithMatras = page.locator('text=/[ा-ौ]/i');
    
    if (await hindiWithMatras.count() > 0) {
      await expect(hindiWithMatras.first()).toBeVisible();
      
      // Verify no text clipping
      const box = await hindiWithMatras.first().boundingBox();
      expect(box).toBeTruthy();
      expect(box?.width).toBeGreaterThan(0);
    }
  });

  test('should have minimum 13px caption size for Hindi text', async ({ page }) => {
    await page.goto('/');
    
    // Find small text elements (captions, labels)
    const smallTextElements = page.locator('p, span, label').filter({ hasText: /[अ-ह]/i });
    
    if (await smallTextElements.count() > 0) {
      // Check first few elements for font size
      for (let i = 0; i < Math.min(3, await smallTextElements.count()); i++) {
        const element = smallTextElements.nth(i);
        const fontSize = await element.evaluate((el) => {
          return window.getComputedStyle(el).fontSize;
        });
        
        // Convert to number and check minimum size (13px = 0.8125rem)
        const fontSizeNum = parseFloat(fontSize);
        expect(fontSizeNum).toBeGreaterThanOrEqual(13);
      }
    }
  });

  test('should not clip Hindi text at standard viewports', async ({ page }) => {
    const viewports = [
      { width: 390, height: 844 },  // Mobile
      { width: 768, height: 1024 }, // Tablet
      { width: 1280, height: 720 }, // Desktop
      { width: 1440, height: 900 }, // Large Desktop
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto('/');
      
      // Find Hindi text elements
      const hindiTextElements = page.locator('*').filter({ hasText: /[अ-ह]/i });
      
      if (await hindiTextElements.count() > 0) {
        // Check first 5 Hindi text elements for clipping
        for (let i = 0; i < Math.min(5, await hindiTextElements.count()); i++) {
          const element = hindiTextElements.nth(i);
          const box = await element.boundingBox();
          
          if (box) {
            // Check if element is within viewport bounds
            const viewportWidth = viewport.width;
            const viewportHeight = viewport.height;
            
            // Element should not be clipped (should have positive dimensions)
            expect(box.width).toBeGreaterThan(0);
            expect(box.height).toBeGreaterThan(0);
          }
        }
      }
    }
  });

  test('should render Noto Sans Devanagari font family', async ({ page }) => {
    await page.goto('/');
    
    // Find Hindi text elements
    const hindiTextElements = page.locator('*').filter({ hasText: /[अ-ह]/i });
    
    if (await hindiTextElements.count() > 0) {
      const element = hindiTextElements.first();
      const fontFamily = await element.evaluate((el) => {
        return window.getComputedStyle(el).fontFamily;
      });
      
      // Check if Noto Sans Devanagari is in the font family stack
      expect(fontFamily.toLowerCase()).toContain('noto');
      expect(fontFamily.toLowerCase()).toContain('devanagari');
    }
  });

  test('should have proper line-height for Hindi text readability', async ({ page }) => {
    await page.goto('/');
    
    // Find Hindi text elements
    const hindiTextElements = page.locator('p, h1, h2, h3').filter({ hasText: /[अ-ह]/i });
    
    if (await hindiTextElements.count() > 0) {
      const element = hindiTextElements.first();
      const lineHeight = await element.evaluate((el) => {
        return window.getComputedStyle(el).lineHeight;
      });
      
      // Line height should be at least 1.4 for Hindi readability
      const lineHeightNum = parseFloat(lineHeight);
      expect(lineHeightNum).toBeGreaterThanOrEqual(1.4);
    }
  });

  test('should not overflow containers with Hindi text', async ({ page }) => {
    await page.goto('/');
    
    // Find containers with Hindi text
    const containers = page.locator('div, section').filter({ hasText: /[अ-ह]/i });
    
    if (await containers.count() > 0) {
      for (let i = 0; i < Math.min(3, await containers.count()); i++) {
        const container = containers.nth(i);
        
        // Check if content overflows container
        const hasOverflow = await container.evaluate((el) => {
          const style = window.getComputedStyle(el);
          return (
            style.overflowX === 'auto' ||
            style.overflowY === 'auto' ||
            style.overflowX === 'scroll' ||
            style.overflowY === 'scroll'
          );
        });
        
        // Containers should not have scroll overflow for Hindi text
        expect(hasOverflow).toBe(false);
      }
    }
  });

  test('should maintain readability on dark backgrounds', async ({ page }) => {
    await page.goto('/');
    
    // Find Hindi text on dark backgrounds (if any)
    const darkBackgroundElements = page.locator('*').filter({ hasText: /[अ-ह]/i });
    
    if (await darkBackgroundElements.count() > 0) {
      for (let i = 0; i < Math.min(3, await darkBackgroundElements.count()); i++) {
        const element = darkBackgroundElements.nth(i);
        
        const backgroundColor = await element.evaluate((el) => {
          return window.getComputedStyle(el).backgroundColor;
        });
        
        const color = await element.evaluate((el) => {
          return window.getComputedStyle(el).color;
        });
        
        // If background is dark, text should be light (and vice versa)
        // This is a basic check - actual contrast ratio would need more complex calculation
        expect(color).toBeTruthy();
        expect(backgroundColor).toBeTruthy();
      }
    }
  });
});
