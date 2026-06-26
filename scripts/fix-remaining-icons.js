const fs = require('fs');
const path = require('path');

const dashboardDir = path.join(__dirname, 'apps/web/app/dashboard');
const componentsDir = path.join(__dirname, 'apps/web/components');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Fix icon imports
  const iconReplacements = {
    'Filter': 'Faders',
    'Search': 'MagnifyingGlass',
    'AlertTriangle': 'Warning',
    'MagnifyingGlassGlass': 'MagnifyingGlass',
    'Currency': 'CurrencyDollar',
  };

  for (const [oldIcon, newIcon] of Object.entries(iconReplacements)) {
    if (content.includes(oldIcon)) {
      content = content.replace(new RegExp(oldIcon, 'g'), newIcon);
      modified = true;
    }
  }

  // Fix icon usage in JSX
  if (content.includes('<Filter')) {
    content = content.replace(/<Filter/g, '<Faders');
    modified = true;
  }
  if (content.includes('</Filter>')) {
    content = content.replace(/<\/Filter>/g, '</Faders>');
    modified = true;
  }
  if (content.includes('<Search')) {
    content = content.replace(/<Search/g, '<MagnifyingGlass');
    modified = true;
  }
  if (content.includes('</Search>')) {
    content = content.replace(/<\/Search>/g, '</MagnifyingGlass>');
    modified = true;
  }
  if (content.includes('<AlertTriangle')) {
    content = content.replace(/<AlertTriangle/g, '<Warning');
    modified = true;
  }
  if (content.includes('</AlertTriangle>')) {
    content = content.replace(/<\/AlertTriangle>/g, '</Warning>');
    modified = true;
  }
  if (content.includes('<Currency')) {
    content = content.replace(/<Currency/g, '<CurrencyDollar');
    modified = true;
  }
  if (content.includes('</Currency>')) {
    content = content.replace(/<\/Currency>/g, '</CurrencyDollar>');
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed: ${filePath}`);
    return true;
  }
  return false;
}

function walkDir(dir, callback) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walkDir(filePath, callback);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      callback(filePath);
    }
  }
}

let fixedCount = 0;
walkDir(dashboardDir, (filePath) => {
  if (fixFile(filePath)) {
    fixedCount++;
  }
});
walkDir(componentsDir, (filePath) => {
  if (fixFile(filePath)) {
    fixedCount++;
  }
});

console.log(`\nFixed ${fixedCount} files`);
