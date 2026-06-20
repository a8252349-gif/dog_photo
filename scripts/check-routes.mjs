import fs from 'node:fs';
import path from 'node:path';

const required = [
  'app/page.tsx',
  'app/make/page.tsx',
  'app/dog-id-photo/page.tsx',
  'app/cat-id-photo/page.tsx',
  'app/faq/page.tsx',
  'app/manifest.ts',
  'app/sitemap.ts',
  'app/robots.ts',
];

let failed = false;
for (const file of required) {
  const exists = fs.existsSync(path.resolve(file));
  console.log(`${exists ? 'OK  ' : 'MISS'} ${file}`);
  if (!exists) failed = true;
}
if (failed) process.exit(1);
