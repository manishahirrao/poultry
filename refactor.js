const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('./apps/web/app/api');
let modifiedCount = 0;

const blockRegex = /\s*(?:\/\/.*?\n)*\s*if\s*\(\s*customer\.segment[^)]*\)\s*\{[\s\S]*?status:\s*403[\s\S]*?\);\s*\}/g;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  content = content.replace(/\.select\(['"`]id,\s*segment,\s*role['"`]\)/g, ".select('id')");
  content = content.replace(/\.select\(['"`]id,\s*segment['"`]\)/g, ".select('id')");
  
  content = content.replace(/const customer = customerData as\s*\{\s*id:\s*string;\s*segment:\s*string;\s*role:\s*string\s*\|\s*null\s*\};/g, "const customer = customerData as { id: string };");
  content = content.replace(/const customer = customerData as\s*\{\s*id:\s*string;\s*segment:\s*string\s*\};/g, "const customer = customerData as { id: string };");

  content = content.replace(blockRegex, "");

  if (original !== content) {
    fs.writeFileSync(file, content, 'utf8');
    modifiedCount++;
    console.log(`Modified: ${file}`);
  }
});

console.log(`Successfully refactored ${modifiedCount} API files.`);
