const fs = require('fs');
const path = require('path');

const webDir = path.join(__dirname, 'apps/web');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Fix CurrencyDollarInr -> CurrencyDollar
  if (content.includes('CurrencyDollarInr')) {
    content = content.replace(/CurrencyDollarInr/g, 'CurrencyDollar');
    modified = true;
  }

  // Fix BenchmarkSlidersHorizontalBar -> BenchmarkFilterBar
  if (content.includes('BenchmarkSlidersHorizontalBar')) {
    content = content.replace(/BenchmarkSlidersHorizontalBar/g, 'BenchmarkFilterBar');
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
