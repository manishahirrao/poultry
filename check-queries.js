const fs = require('fs');
const files = [
  'apps/web/app/dashboard/metrics/fcr/page.tsx',
  'apps/web/app/dashboard/metrics/mortality/page.tsx',
  'apps/web/app/dashboard/metrics/feed/page.tsx',
  'apps/web/app/dashboard/metrics/health/page.tsx',
  'apps/web/app/dashboard/metrics/benchmark/page.tsx',
  'apps/web/app/dashboard/reports/page.tsx',
  'apps/web/app/dashboard/reports/integrator/page.tsx'
];

files.forEach(f => {
  if (fs.existsSync(f)) {
    const c = fs.readFileSync(f, 'utf8');
    const matches = [...c.matchAll(/\.from\(['"](?:farms|batches)['"]\)\.select\([\s\S]*?\)/g)];
    console.log('\n--- ' + f + ' ---');
    matches.forEach(m => {
       console.log(m[0].substring(0, 300));
    });
  }
});
