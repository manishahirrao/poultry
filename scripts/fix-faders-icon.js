const fs = require('fs');
const path = require('path');

const webDir = path.join(__dirname, 'apps/web');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Fix Faders -> SlidersHorizontal (valid lucide-react icon)
  if (content.includes('Faders')) {
    content = content.replace(/Faders/g, 'SlidersHorizontal');
    modified = true;
  }

  // Fix onLogFloppyDiskd -> onLogSaved
  if (content.includes('onLogFloppyDiskd')) {
    content = content.replace(/onLogFloppyDiskd/g, 'onLogSaved');
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
