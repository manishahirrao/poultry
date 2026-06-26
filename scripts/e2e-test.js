const puppeteer = require('puppeteer');
const fs = require('fs');

async function run() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ 
    headless: 'new', 
    executablePath: 'C:\\Users\\manis\\.cache\\puppeteer\\chrome\\win64-149.0.7827.22\\chrome-win64\\chrome.exe',
    args: ['--no-sandbox'] 
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  console.log('Navigating to dev-login...');
  await page.goto('http://localhost:3000/api/dev-login');
  
  console.log('Waiting for network idle...');
  await page.waitForNavigation({ waitUntil: 'networkidle0' }).catch(() => {});
  
  const currentUrl = page.url();
  console.log('Current URL:', currentUrl);
  
  await page.screenshot({ path: 'artifacts/screenshot-1-dashboard.png' });
  console.log('Screenshot 1 saved.');

  // Check if we are on dashboard or login
  if (currentUrl.includes('/dashboard')) {
    console.log('Successfully logged in and reached dashboard!');
    
    // Find farms link
    const html = await page.content();
    if (html.includes('My Farms') || html.includes('मेरे Farms')) {
      console.log('Dashboard content looks correct.');
    } else {
      console.log('Could not find Farms link in sidebar. HTML snippet:', html.substring(0, 500));
    }
  } else {
    console.log('Failed to reach dashboard. Currently at:', currentUrl);
  }

  await browser.close();
}

run().catch(console.error);
