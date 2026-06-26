const fs = require('fs');
const path = require('path');

const webDir = path.join(__dirname, 'apps/web');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Fix icon names
  const iconReplacements = {
    'CurrencyDollarInr': 'CurrencyDollar',
    'CurrencyDollarDollar': 'CurrencyDollar',
  };

  for (const [oldIcon, newIcon] of Object.entries(iconReplacements)) {
    if (content.includes(oldIcon)) {
      content = content.replace(new RegExp(oldIcon, 'g'), newIcon);
      modified = true;
    }
  }

  // Fix useMagnifyingGlassParams -> useSearchParams
  if (content.includes('useMagnifyingGlassParams')) {
    content = content.replace(/useMagnifyingGlassParams/g, 'useSearchParams');
    modified = true;
  }

  // Fix URLMagnifyingGlassParams -> URLSearchParams
  if (content.includes('URLMagnifyingGlassParams')) {
    content = content.replace(/URLMagnifyingGlassParams/g, 'URLSearchParams');
    modified = true;
  }

  // Fix lucide-react Warning -> AlertTriangle
  if (content.includes("from 'lucide-react'")) {
    content = content.replace(/from 'lucide-react'/g, "from 'lucide-react'\nimport { AlertTriangle as Warning } from 'lucide-react'");
    modified = true;
  }

  // Fix formatIndianCurrencyDollar -> formatIndianCurrency
  if (content.includes('formatIndianCurrencyDollar')) {
    content = content.replace(/formatIndianCurrencyDollar/g, 'formatIndianCurrency');
    modified = true;
  }

  // Fix CSS properties
  if (content.includes('WebkitBackdropFaders')) {
    content = content.replace(/WebkitBackdropFaders/g, 'WebkitBackdropFilter');
    modified = true;
  }
  if (content.includes('backdropFaders')) {
    content = content.replace(/backdropFaders/g, 'backdropFilter');
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
walkDir(webDir, (filePath) => {
  if (fixFile(filePath)) {
    fixedCount++;
  }
});

console.log(`\nFixed ${fixedCount} files`);
