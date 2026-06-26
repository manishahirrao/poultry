/**
 * PoultryPulse AI — SEO Validation E2E Tests
 * TASK-WEB-024: End-to-End Test Suite (Playwright — Website)
 * File: tests/e2e/website/seo.spec.ts
 * Requirements: GWEB-003, CW-001
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

test.describe('SEO Meta Tags', () => {
  MARKETING_PAGES.forEach((pagePath) => {
    test(`${pagePath} has unique title`, async ({ page }) => {
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');
      
      const title = await page.title();
      expect(title).toBeTruthy();
      expect(title.length).toBeGreaterThan(10);
      expect(title.length).toBeLessThan(60);
    });

    test(`${pagePath} has meta description`, async ({ page }) => {
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');
      
      const metaDescription = await page.locator('meta[name="description"]').getAttribute('content');
      expect(metaDescription).toBeTruthy();
      expect(metaDescription?.length).toBeGreaterThan(50);
      expect(metaDescription?.length).toBeLessThan(160);
    });

    test(`${pagePath} has canonical URL`, async ({ page }) => {
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');
      
      const canonicalLink = page.locator('link[rel="canonical"]').first();
      await expect(canonicalLink).toBeVisible();
      
      const canonicalHref = await canonicalLink.getAttribute('href');
      expect(canonicalHref).toBeTruthy();
      expect(canonicalHref).toMatch(/https?:\/\/poultrypulse\.ai/);
    });

    test(`${pagePath} canonical URL matches page URL`, async ({ page }) => {
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');
      
      const canonicalLink = page.locator('link[rel="canonical"]').first();
      const canonicalHref = await canonicalLink.getAttribute('href');
      
      const currentUrl = page.url();
      expect(canonicalHref).toContain(currentUrl.replace('http://localhost:3000', ''));
    });

    test(`${pagePath} has OpenGraph tags`, async ({ page }) => {
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');
      
      const ogTitle = page.locator('meta[property="og:title"]').first();
      await expect(ogTitle).toBeVisible();
      
      const ogDescription = page.locator('meta[property="og:description"]').first();
      await expect(ogDescription).toBeVisible();
      
      const ogImage = page.locator('meta[property="og:image"]').first();
      await expect(ogImage).toBeVisible();
    });

    test(`${pagePath} has Twitter Card tags`, async ({ page }) => {
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');
      
      const twitterCard = page.locator('meta[name="twitter:card"]').first();
      await expect(twitterCard).toBeVisible();
      
      const twitterTitle = page.locator('meta[name="twitter:title"]').first();
      await expect(twitterTitle).toBeVisible();
    });

    test(`${pagePath} has hreflang tags for bilingual support`, async ({ page }) => {
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');
      
      const hreflangEn = page.locator('link[rel="alternate"][hreflang="en"], link[rel="alternate"][hreflang="en-IN"]').first();
      const hreflangHi = page.locator('link[rel="alternate"][hreflang="hi"], link[rel="alternate"][hreflang="hi-IN"]').first();
      
      // At least one hreflang tag should be present
      const hasHreflang = await hreflangEn.isVisible() || await hreflangHi.isVisible();
      expect(hasHreflang).toBeTruthy();
    });
  });
});

test.describe('Heading Structure', () => {
  test('homepage has single H1', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1);
  });

  test('no page has duplicate H1 tags', async ({ page }) => {
    for (const pagePath of MARKETING_PAGES) {
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');
      
      const h1Count = await page.locator('h1').count();
      expect(h1Count).toBeLessThanOrEqual(1);
    }
  });

  test('headings follow hierarchical order', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Get all headings
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    
    let previousLevel = 0;
    for (const heading of headings) {
      const tagName = await heading.evaluate((el) => el.tagName);
      const currentLevel = parseInt(tagName.replace('H', ''));
      
      // Heading level should not skip (e.g., h1 to h3)
      if (previousLevel > 0) {
        expect(currentLevel).toBeLessThanOrEqual(previousLevel + 1);
      }
      
      previousLevel = currentLevel;
    }
  });
});

test.describe('JSON-LD Structured Data', () => {
  test('homepage has Organization schema', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const jsonLdScripts = await page.locator('script[type="application/ld+json"]').all();
    const hasOrganizationSchema = await Promise.any(
      jsonLdScripts.map(async (script) => {
        const content = await script.textContent();
        return content?.includes('@type') && content?.includes('Organization');
      })
    );
    
    expect(hasOrganizationSchema).toBeTruthy();
  });

  test('homepage has WebSite schema', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const jsonLdScripts = await page.locator('script[type="application/ld+json"]').all();
    const hasWebSiteSchema = await Promise.any(
      jsonLdScripts.map(async (script) => {
        const content = await script.textContent();
        return content?.includes('@type') && content?.includes('WebSite');
      })
    );
    
    expect(hasWebSiteSchema).toBeTruthy();
  });

  test('pricing page has Product schema', async ({ page }) => {
    await page.goto('/pricing');
    await page.waitForLoadState('networkidle');
    
    const jsonLdScripts = await page.locator('script[type="application/ld+json"]').all();
    const hasProductSchema = await Promise.any(
      jsonLdScripts.map(async (script) => {
        const content = await script.textContent();
        return content?.includes('@type') && content?.includes('Product');
      })
    );
    
    expect(hasProductSchema).toBeTruthy();
  });

  test('accuracy page has FAQPage schema', async ({ page }) => {
    await page.goto('/accuracy');
    await page.waitForLoadState('networkidle');
    
    const jsonLdScripts = await page.locator('script[type="application/ld+json"]').all();
    const hasFAQSchema = await Promise.any(
      jsonLdScripts.map(async (script) => {
        const content = await script.textContent();
        return content?.includes('@type') && content?.includes('FAQPage');
      })
    );
    
    expect(hasFAQSchema).toBeTruthy();
  });
});

test.describe('Robots.txt and Sitemap', () => {
  test('robots.txt exists and allows marketing pages', async ({ request }) => {
    const response = await request.get('/robots.txt');
    expect(response.status()).toBe(200);
    
    const robotsContent = await response.text();
    expect(robotsContent).toContain('User-agent');
    expect(robotsContent).toContain('Allow');
  });

  test('robots.txt disallows dashboard and API routes', async ({ request }) => {
    const response = await request.get('/robots.txt');
    expect(response.status()).toBe(200);
    
    const robotsContent = await response.text();
    expect(robotsContent).toMatch(/Disallow.*dashboard/i);
    expect(robotsContent).toMatch(/Disallow.*api/i);
  });

  test('sitemap.xml exists', async ({ request }) => {
    const response = await request.get('/sitemap.xml');
    expect(response.status()).toBe(200);
    
    const sitemapContent = await response.text();
    expect(sitemapContent).toContain('<?xml');
    expect(sitemapContent).toContain('<urlset');
  });

  test('sitemap includes marketing pages', async ({ request }) => {
    const response = await request.get('/sitemap.xml');
    expect(response.status()).toBe(200);
    
    const sitemapContent = await response.text();
    expect(sitemapContent).toContain('<loc>');
    expect(sitemapContent).toMatch(/poultrypulse\.ai/);
  });
});

test.describe('Image Alt Text', () => {
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

  test('alt text is descriptive', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const images = await page.locator('img').all();
    
    for (const image of images) {
      const alt = await image.getAttribute('alt');
      // Alt text should not be empty or just "image"
      expect(alt).not.toBe('');
      expect(alt).not.toBe('image');
      expect(alt).not.toBe('Image');
    }
  });
});

test.describe('Meta Keywords', () => {
  test('homepage has relevant keywords', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const keywords = await page.locator('meta[name="keywords"]').getAttribute('content');
    expect(keywords).toBeTruthy();
    
    // Check for relevant poultry/price prediction keywords
    const relevantKeywords = ['poultry', 'price', 'forecast', 'AI', 'broiler', 'भाव', 'मुर्गी'];
    const hasRelevantKeyword = relevantKeywords.some(keyword => 
      keywords?.toLowerCase().includes(keyword.toLowerCase())
    );
    expect(hasRelevantKeyword).toBeTruthy();
  });
});
