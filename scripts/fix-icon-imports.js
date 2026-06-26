const fs = require('fs');
const path = require('path');

const dashboardDir = path.join(__dirname, 'apps/web/app/dashboard');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Fix icon imports
  const iconReplacements = {
    'Trash2': 'Trash',
    'Save': 'FloppyDisk',
    'Magnifying': 'MagnifyingGlass',
  };

  for (const [oldIcon, newIcon] of Object.entries(iconReplacements)) {
    if (content.includes(oldIcon)) {
      content = content.replace(new RegExp(oldIcon, 'g'), newIcon);
      modified = true;
    }
  }

  // Fix icon usage in JSX
  if (content.includes('<Trash2')) {
    content = content.replace(/<Trash2/g, '<Trash');
    modified = true;
  }
  if (content.includes('</Trash2>')) {
    content = content.replace(/<\/Trash2>/g, '</Trash>');
    modified = true;
  }
  if (content.includes('<Save')) {
    content = content.replace(/<Save/g, '<FloppyDisk');
    modified = true;
  }
  if (content.includes('</Save>')) {
    content = content.replace(/<\/Save>/g, '</FloppyDisk>');
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
    } else if (file.endsWith('.tsx')) {
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

console.log(`\nFixed ${fixedCount} files`);
