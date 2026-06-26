// PoultryPulse AI — Deployment Verification Script
// File: scripts/verify-deployment.js
// Task Reference: TASK-WEB-027
// Description: Automated verification of production deployment

const https = require('https');

// Production URL configuration
const PRODUCTION_URL = 'https://poultrypulse.ai';
const API_BASE = `${PRODUCTION_URL}/api`;

// List of 15 pages to verify
const PAGES = [
  '/',
  '/features',
  '/pricing',
  '/accuracy',
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
  '/blog'
];

// API endpoints to verify
const API_ENDPOINTS = [
  '/public/accuracy-summary',
  '/public/demo-request'
];

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function checkPage(url) {
  return new Promise((resolve) => {
    const fullUrl = url.startsWith('http') ? url : `${PRODUCTION_URL}${url}`;
    
    https.get(fullUrl, (res) => {
      const statusCode = res.statusCode;
      const isSuccess = statusCode >= 200 && statusCode < 300;
      
      resolve({
        url: fullUrl,
        statusCode,
        success: isSuccess,
        redirected: res.headers.location ? res.headers.location : null
      });
    }).on('error', (err) => {
      resolve({
        url: fullUrl,
        statusCode: 0,
        success: false,
        error: err.message
      });
    });
  });
}

async function verifyPages() {
  log('\n=== Verifying Page Availability ===', colors.blue);
  
  const results = [];
  let successCount = 0;
  
  for (const page of PAGES) {
    const result = await checkPage(page);
    results.push(result);
    
    if (result.success) {
      log(`✓ ${result.url} - ${result.statusCode}`, colors.green);
      successCount++;
    } else {
      log(`✗ ${result.url} - ${result.statusCode || 'ERROR'}`, colors.red);
      if (result.error) {
        log(`  Error: ${result.error}`, colors.red);
      }
    }
  }
  
  log(`\nPages: ${successCount}/${PAGES.length} successful`, 
    successCount === PAGES.length ? colors.green : colors.yellow);
  
  return results;
}

async function verifyAPIEndpoints() {
  log('\n=== Verifying API Endpoints ===', colors.blue);
  
  const results = [];
  let successCount = 0;
  
  for (const endpoint of API_ENDPOINTS) {
    const result = await checkPage(`${API_BASE}${endpoint}`);
    results.push(result);
    
    if (result.success) {
      log(`✓ ${API_BASE}${endpoint} - ${result.statusCode}`, colors.green);
      successCount++;
    } else {
      log(`✗ ${API_BASE}${endpoint} - ${result.statusCode || 'ERROR'}`, colors.red);
      if (result.error) {
        log(`  Error: ${result.error}`, colors.red);
      }
    }
  }
  
  log(`\nAPI Endpoints: ${successCount}/${API_ENDPOINTS.length} successful`, 
    successCount === API_ENDPOINTS.length ? colors.green : colors.yellow);
  
  return results;
}

async function verifySitemap() {
  log('\n=== Verifying Sitemap ===', colors.blue);
  
  const result = await checkPage('/sitemap.xml');
  
  if (result.success) {
    log(`✓ Sitemap accessible - ${result.statusCode}`, colors.green);
    return true;
  } else {
    log(`✗ Sitemap not accessible - ${result.statusCode || 'ERROR'}`, colors.red);
    return false;
  }
}

async function verifyRobots() {
  log('\n=== Verifying Robots.txt ===', colors.blue);
  
  const result = await checkPage('/robots.txt');
  
  if (result.success) {
    log(`✓ Robots.txt accessible - ${result.statusCode}`, colors.green);
    return true;
  } else {
    log(`✗ Robots.txt not accessible - ${result.statusCode || 'ERROR'}`, colors.red);
    return false;
  }
}

async function verifySSL() {
  log('\n=== Verifying SSL Certificate ===', colors.blue);
  
  const result = await checkPage('/');
  
  if (result.success && result.url.startsWith('https://')) {
    log(`✓ SSL certificate valid - HTTPS enforced`, colors.green);
    return true;
  } else {
    log(`✗ SSL certificate check failed`, colors.red);
    return false;
  }
}

async function verifyCanonicalRedirects() {
  log('\n=== Verifying Canonical Domain Redirects ===', colors.blue);
  
  const wwwRedirects = [
    'https://www.poulse.ai',
    'https://www.poultrypulse.ai'
  ];
  
  let successCount = 0;
  
  for (const url of wwwRedirects) {
    try {
      const result = await checkPage(url);
      if (result.redirected && result.redirected.includes(url.replace('www.', ''))) {
        log(`✓ ${url} redirects to canonical domain`, colors.green);
        successCount++;
      } else {
        log(`✗ ${url} does not redirect properly`, colors.red);
      }
    } catch (error) {
      log(`✗ ${url} - ERROR: ${error.message}`, colors.red);
    }
  }
  
  log(`\nRedirects: ${successCount}/${wwwRedirects.length} successful`, 
    successCount === wwwRedirects.length ? colors.green : colors.yellow);
  
  return successCount === wwwRedirects.length;
}

async function main() {
  log('╔════════════════════════════════════════════════════════════╗', colors.blue);
  log('║   PoultryPulse AI — Deployment Verification Script        ║', colors.blue);
  log('║   Task Reference: TASK-WEB-027                             ║', colors.blue);
  log('╚════════════════════════════════════════════════════════════╝', colors.blue);
  
  log(`\nTarget: ${PRODUCTION_URL}`, colors.yellow);
  log(`Timestamp: ${new Date().toISOString()}\n`, colors.yellow);
  
  const pageResults = await verifyPages();
  const apiResults = await verifyAPIEndpoints();
  const sitemapValid = await verifySitemap();
  const robotsValid = await verifyRobots();
  const sslValid = await verifySSL();
  const redirectsValid = await verifyCanonicalRedirects();
  
  // Summary
  log('\n╔════════════════════════════════════════════════════════════╗', colors.blue);
  log('║                    VERIFICATION SUMMARY                      ║', colors.blue);
  log('╚════════════════════════════════════════════════════════════╝', colors.blue);
  
  const allChecks = [
    { name: 'Pages', passed: pageResults.every(r => r.success) },
    { name: 'API Endpoints', passed: apiResults.every(r => r.success) },
    { name: 'Sitemap', passed: sitemapValid },
    { name: 'Robots.txt', passed: robotsValid },
    { name: 'SSL Certificate', passed: sslValid },
    { name: 'Canonical Redirects', passed: redirectsValid }
  ];
  
  allChecks.forEach(check => {
    log(`${check.passed ? '✓' : '✗'} ${check.name}`, 
      check.passed ? colors.green : colors.red);
  });
  
  const allPassed = allChecks.every(check => check.passed);
  
  log('\n' + (allPassed ? '✓ ALL CHECKS PASSED' : '✗ SOME CHECKS FAILED'), 
    allPassed ? colors.green : colors.red);
  
  process.exit(allPassed ? 0 : 1);
}

// Run verification
main().catch(error => {
  log(`\n✗ Verification failed with error: ${error.message}`, colors.red);
  process.exit(1);
});
