/**
 * QA-001 — Performance Testing Script
 * Phase 13: Final QA & Launch
 * 
 * Performance Testing Requirements:
 * - Tool: WebPageTest.org (free, real devices)
 * - Run from: Mumbai location (closest to primary users)
 * - Throttle: "Mobile — 4G" preset
 * - Threshold: LCP < 3s, CLS < 0.05
 * 
 * This script provides instructions and a local Lighthouse alternative
 */

const pages = [
  'http://localhost:3000/',
  'http://localhost:3000/pricing',
  'http://localhost:3000/features/whatsapp-log',
  'http://localhost:3000/features/farm-management',
  'http://localhost:3000/features/price-intel',
  'http://localhost:3000/accuracy',
  'http://localhost:3000/solutions/integrators',
  'http://localhost:3000/solutions/farms',
  'http://localhost:3000/signup',
];

console.log('=== QA-001 Performance Testing Instructions ===\n');
console.log('WebPageTest.org Manual Testing:');
console.log('1. Visit https://www.webpagetest.org/');
console.log('2. Enter each URL from the list below');
console.log('3. Test Location: Mumbai, India (or closest available)');
console.log('4. Browser: Chrome (Desktop) and Chrome (Mobile)');
console.log('5. Connection: Mobile 4G (3 Mbps)');
console.log('6. Number of Tests: 3 (for consistency)');
console.log('7. Click "Start Test"\n');
console.log('Pages to test:');
pages.forEach((page, index) => {
  console.log(`${index + 1}. ${page}`);
});
console.log('\nThresholds to verify:');
console.log('- Largest Contentful Paint (LCP): < 3.0s');
console.log('- Cumulative Layout Shift (CLS): < 0.05');
console.log('- First Contentful Paint (FCP): < 2.0s');
console.log('- Time to Interactive (TTI): < 5.0s');
console.log('- Speed Index: < 4.0s\n');
console.log('=== Local Lighthouse Testing Alternative ===');
console.log('Run: npm run lighthouse');
console.log('Or: npx lighthouse <url> --view --preset=desktop --throttling-method=devtools\n');
