import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Test Configuration
 * FlockIQ Pre-Login Website - QA-001 Cross-Browser Testing Matrix
 * Phase 13: Final QA & Launch
 * 
 * Browsers to test:
 * - Chrome (Windows + macOS + Android)
 * - Firefox (Windows + macOS)
 * - Safari (macOS + iOS 16+)
 * - Samsung Internet (Android - important for Indian market)
 * - Edge (Windows)
 * 
 * Devices to test:
 * - iPhone 14 Pro (iOS 17, Safari)
 * - iPhone SE 3rd gen (iOS 16, small screen)
 * - Samsung Galaxy A54 (Android 13, mid-range - most common in UP)
 * - Samsung Galaxy S23 (Android 14, high-end)
 * - iPad Air 5th gen (Safari, tablet)
 * - Desktop 1920×1080 (Chrome)
 * - Desktop 1280×800 (Chrome - smaller laptop screen)
 */

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['list'],
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    // Desktop Browsers
    {
      name: 'chromium-desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1920, height: 1080 } },
    },
    {
      name: 'chromium-laptop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'], viewport: { width: 1920, height: 1080 } },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'], viewport: { width: 1920, height: 1080 } },
    },
    {
      name: 'edge',
      use: { ...devices['Desktop Edge'], viewport: { width: 1920, height: 1080 } },
    },

    // iOS Devices
    {
      name: 'iphone-14-pro',
      use: { ...devices['iPhone 14 Pro'] },
    },
    {
      name: 'iphone-se',
      use: { ...devices['iPhone SE'] },
    },
    {
      name: 'ipad-air',
      use: { ...devices['iPad Air'] },
    },

    // Android Devices
    {
      name: 'galaxy-s23',
      use: { ...devices['Galaxy S23'] },
    },
    {
      name: 'galaxy-a54',
      use: { ...devices['Galaxy A54'] },
    },
    {
      name: 'pixel-5',
      use: { ...devices['Pixel 5'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
