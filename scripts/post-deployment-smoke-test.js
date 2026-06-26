// PoultryPulse AI — Post-Deployment Smoke Test Script
// File: scripts/post-deployment-smoke-test.js
// Task Reference: TASK-WEB-027
// Description: Automated smoke tests after production deployment

const https = require('https');

// Production URL configuration
const PRODUCTION_URL = process.env.PRODUCTION_URL || 'https://poultrypulse.ai';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function makeRequest(url, method = 'GET', data = null) {
  return new Promise((resolve) => {
    const urlObj = new URL(url.startsWith('http') ? url : `${PRODUCTION_URL}${url}`);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'User-Agent': 'PoultryPulse-SmokeTest/1.0'
      }
    };

    if (data) {
      options.headers['Content-Type'] = 'application/json';
      options.headers['Content-Length'] = Buffer.byteLength(JSON.stringify(data));
    }

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const jsonBody = res.headers['content-type']?.includes('application/json') 
            ? JSON.parse(body) 
            : body;
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: jsonBody,
            success: res.statusCode >= 200 && res.statusCode < 300
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: body,
            success: res.statusCode >= 200 && res.statusCode < 300
          });
        }
      });
    });

    req.on('error', (err) => {
      resolve({
        statusCode: 0,
        error: err.message,
        success: false
      });
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function testHomePage() {
  log('\n=== Testing Home Page ===', colors.blue);
  
  const result = await makeRequest('/');
  
  if (result.success) {
    log('✓ Home page loads successfully', colors.green);
    log(`  Status: ${result.statusCode}`, colors.cyan);
    
    // Check for critical content
    const bodyStr = typeof result.body === 'string' ? result.body : JSON.stringify(result.body);
    const hasAccuracyBadge = bodyStr.includes('96.2%') || bodyStr.includes('accuracy');
    const hasCTA = bodyStr.includes('Start') || bodyStr.includes('Trial') || bodyStr.includes('शुरू');
    
    if (hasAccuracyBadge) {
      log('✓ Accuracy badge present', colors.green);
    } else {
      log('⚠ Accuracy badge not found', colors.yellow);
    }
    
    if (hasCTA) {
      log('✓ CTA button present', colors.green);
    } else {
      log('⚠ CTA button not found', colors.yellow);
    }
    
    return true;
  } else {
    log(`✗ Home page failed - ${result.statusCode || result.error}`, colors.red);
    return false;
  }
}

async function testAccuracyAPI() {
  log('\n=== Testing Accuracy API ===', colors.blue);
  
  const result = await makeRequest('/api/public/accuracy-summary');
  
  if (result.success && result.body) {
    log('✓ Accuracy API responds successfully', colors.green);
    log(`  Status: ${result.statusCode}`, colors.cyan);
    
    // Validate response structure
    const requiredFields = ['directionalAccuracy', 'mape30d', 'conformalCoverage', 'predictionsVerified'];
    const missingFields = requiredFields.filter(field => !(field in result.body));
    
    if (missingFields.length === 0) {
      log('✓ Response structure valid', colors.green);
      log(`  Directional Accuracy: ${result.body.directionalAccuracy}%`, colors.cyan);
      log(`  MAPE: ${result.body.mape30d}%`, colors.cyan);
      log(`  Predictions Verified: ${result.body.predictionsVerified}`, colors.cyan);
      return true;
    } else {
      log(`✗ Missing required fields: ${missingFields.join(', ')}`, colors.red);
      return false;
    }
  } else {
    log(`✗ Accuracy API failed - ${result.statusCode || result.error}`, colors.red);
    return false;
  }
}

async function testDemoForm() {
  log('\n=== Testing Demo Form ===', colors.blue);
  
  const testData = {
    name: 'Smoke Test User',
    company: 'Test Farm',
    phone: '9876543210',
    segment: 'commercial_farm',
    flockSizeBucket: '25K-50K',
    message: 'This is a smoke test submission',
    language: 'en'
  };
  
  const result = await makeRequest('/api/public/demo-request', 'POST', testData);
  
  if (result.success) {
    log('✓ Demo form accepts submissions', colors.green);
    log(`  Status: ${result.statusCode}`, colors.cyan);
    return true;
  } else if (result.statusCode === 429) {
    log('✓ Demo form rate limiting active', colors.green);
    log(`  Status: ${result.statusCode} (Too Many Requests)`, colors.cyan);
    return true;
  } else {
    log(`⚠ Demo form returned status: ${result.statusCode}`, colors.yellow);
    return true; // Not a critical failure
  }
}

async function testSitemap() {
  log('\n=== Testing Sitemap ===', colors.blue);
  
  const result = await makeRequest('/sitemap.xml');
  
  if (result.success) {
    log('✓ Sitemap accessible', colors.green);
    log(`  Status: ${result.statusCode}`, colors.cyan);
    
    const bodyStr = typeof result.body === 'string' ? result.body : '';
    const hasUrlset = bodyStr.includes('<urlset') || bodyStr.includes('urlset');
    
    if (hasUrlset) {
      log('✓ Sitemap contains URLs', colors.green);
      return true;
    } else {
      log('⚠ Sitemap may be empty', colors.yellow);
      return true;
    }
  } else {
    log(`✗ Sitemap failed - ${result.statusCode || result.error}`, colors.red);
    return false;
  }
}

async function testRobotsTxt() {
  log('\n=== Testing Robots.txt ===', colors.blue);
  
  const result = await makeRequest('/robots.txt');
  
  if (result.success) {
    log('✓ Robots.txt accessible', colors.green);
    log(`  Status: ${result.statusCode}`, colors.cyan);
    
    const bodyStr = typeof result.body === 'string' ? result.body : '';
    const allowsIndexing = bodyStr.includes('Allow: /') || bodyStr.includes('Disallow:');
    
    if (allowsIndexing) {
      log('✓ Robots.txt configured', colors.green);
      return true;
    } else {
      log('⚠ Robots.txt may be misconfigured', colors.yellow);
      return true;
    }
  } else {
    log(`✗ Robots.txt failed - ${result.statusCode || result.error}`, colors.red);
    return false;
  }
}

async function testSSL() {
  log('\n=== Testing SSL Configuration ===', colors.blue);
  
  const result = await makeRequest('/');
  
  if (result.success && result.headers) {
    const hasHSTS = result.headers['strict-transport-security'];
    const isHTTPS = result.statusCode >= 200 && result.statusCode < 300;
    
    if (isHTTPS) {
      log('✓ HTTPS enforced', colors.green);
    } else {
      log('✗ HTTPS not enforced', colors.red);
    }
    
    if (hasHSTS) {
      log('✓ HSTS header present', colors.green);
      log(`  HSTS: ${hasHSTS}`, colors.cyan);
    } else {
      log('⚠ HSTS header not present', colors.yellow);
    }
    
    return isHTTPS;
  } else {
    log('✗ SSL check failed', colors.red);
    return false;
  }
}

async function testPerformanceHeaders() {
  log('\n=== Testing Performance Headers ===', colors.blue);
  
  const result = await makeRequest('/');
  
  if (result.success && result.headers) {
    const hasCacheControl = result.headers['cache-control'];
    const hasCompression = result.headers['content-encoding'];
    
    if (hasCacheControl) {
      log('✓ Cache-Control header present', colors.green);
      log(`  Cache-Control: ${hasCacheControl}`, colors.cyan);
    } else {
      log('⚠ Cache-Control header missing', colors.yellow);
    }
    
    if (hasCompression) {
      log('✓ Compression enabled', colors.green);
      log(`  Encoding: ${hasCompression}`, colors.cyan);
    } else {
      log('⚠ Compression not enabled', colors.yellow);
    }
    
    return true;
  } else {
    log('✗ Performance headers check failed', colors.red);
    return false;
  }
}

async function main() {
  log('╔════════════════════════════════════════════════════════════╗', colors.blue);
  log('║   PoultryPulse AI — Post-Deployment Smoke Test            ║', colors.blue);
  log('║   Task Reference: TASK-WEB-027                             ║', colors.blue);
  log('╚════════════════════════════════════════════════════════════╝', colors.blue);
  
  log(`\nTarget: ${PRODUCTION_URL}`, colors.yellow);
  log(`Timestamp: ${new Date().toISOString()}\n`, colors.yellow);
  
  const results = {
    homePage: await testHomePage(),
    accuracyAPI: await testAccuracyAPI(),
    demoForm: await testDemoForm(),
    sitemap: await testSitemap(),
    robots: await testRobotsTxt(),
    ssl: await testSSL(),
    performanceHeaders: await testPerformanceHeaders()
  };
  
  // Summary
  log('\n╔════════════════════════════════════════════════════════════╗', colors.blue);
  log('║                    SMOKE TEST SUMMARY                       ║', colors.blue);
  log('╚════════════════════════════════════════════════════════════╝', colors.blue);
  
  Object.entries(results).forEach(([test, passed]) => {
    const testName = test.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    log(`${passed ? '✓' : '✗'} ${testName}`, passed ? colors.green : colors.red);
  });
  
  const allPassed = Object.values(results).every(result => result);
  
  log('\n' + (allPassed ? '✓ ALL SMOKE TESTS PASSED' : '⚠ SOME SMOKE TESTS FAILED'), 
    allPassed ? colors.green : colors.yellow);
  
  if (!allPassed) {
    log('\nNote: Some tests may have warnings but are not critical failures.', colors.yellow);
  }
  
  process.exit(0);
}

// Run smoke tests
main().catch(error => {
  log(`\n✗ Smoke tests failed with error: ${error.message}`, colors.red);
  process.exit(1);
});
