module.exports = {
  extends: 'lighthouse:default',
  settings: {
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    formFactor: 'desktop',
    screenEmulation: {
      mobile: false,
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
      disabled: false,
    },
    throttling: {
      rttMs: 40,
      throughputKbps: 10240,
      cpuSlowdownMultiplier: 1,
      requestLatencyMs: 0,
      downloadThroughputKbps: 0,
      uploadThroughputKbps: 0,
    },
    emulatedUserAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
    // Score thresholds for CI - TTI target <3s on desktop broadband
    throttlingMethod: 'devtools',
  },
  passes: [
    {
      passName: 'defaultPass',
      recordTrace: true,
      useThrottling: true,
      pauseAfterLoadMs: 5000,
      networkQuietThresholdMs: 5000,
      cpuQuietThresholdMs: 5000,
    },
  ],
  audits: [
    'first-contentful-paint',
    'largest-contentful-paint',
    'cumulative-layout-shift',
    'total-blocking-time',
    'interactive',
    'speed-index',
    'max-potential-fid',
    'accessibility',
    'best-practices',
    'seo',
  ],
  categories: {
    performance: {
      weight: 1,
    },
    accessibility: {
      weight: 1,
    },
    'best-practices': {
      weight: 1,
    },
    seo: {
      weight: 1,
    },
  },
};
