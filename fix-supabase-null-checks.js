const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, 'apps/web/components');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Add null checks for supabase usage
  // Pattern: await supabase. -> if (!supabase) return; await supabase.
  if (content.includes('await supabase.') && !content.includes('if (!supabase)')) {
    // Find the component function and add null check after supabase initialization
    const lines = content.split('\n');
    let newLines = [];
    let addedCheck = false;

    for (let i = 0; i < lines.length; i++) {
      newLines.push(lines[i]);
      
      // Check if this line creates supabase client
      if (lines[i].includes('const supabase =') && !addedCheck) {
        // Add null check after the next line
        if (i + 1 < lines.length) {
          newLines.push(lines[i + 1]);
          i++;
          // Add null check
          const indent = lines[i].match(/^\s*/)[0];
          newLines.push(indent + 'if (!supabase) return null;');
          addedCheck = true;
        }
      }
    }

    if (addedCheck) {
      content = newLines.join('\n');
      modified = true;
    }
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
walkDir(componentsDir, (filePath) => {
  if (fixFile(filePath)) {
    fixedCount++;
  }
});

console.log(`\nFixed ${fixedCount} files`);
