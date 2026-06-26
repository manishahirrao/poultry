const fs = require('fs');
const path = require('path');

const apiDir = path.join(__dirname, 'apps/web/app/api');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Replace import
  if (content.includes("import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';")) {
    content = content.replace(
      "import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';",
      "import { createClient } from '@/utils/supabase/server';"
    );
    modified = true;
  }

  // Remove cookies import if it exists
  if (content.includes("import { cookies } from 'next/headers';")) {
    content = content.replace("import { cookies } from 'next/headers';\n", '');
    modified = true;
  }

  // Replace createRouteHandlerClient usage
  if (content.includes('createRouteHandlerClient({ cookies })')) {
    content = content.replace(
      /const supabase = createRouteHandlerClient\(\{ cookies \}\);/g,
      'const supabase = await createClient();\n    if (!supabase) {\n      return NextResponse.json(\n        { error: \'Supabase client not initialized\' },\n        { status: 500 }\n      );\n    }'
    );
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
    } else if (file === 'route.ts') {
      callback(filePath);
    }
  }
}

let fixedCount = 0;
walkDir(apiDir, (filePath) => {
  if (fixFile(filePath)) {
    fixedCount++;
  }
});

console.log(`\nFixed ${fixedCount} files`);
