import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const required = [
  'src/PortalApp.tsx',
  'src/routes/portalRoutes.tsx',
  'src/index.css',
  'src/main.tsx',
];
const missing = required.filter((rel) => !existsSync(resolve(process.cwd(), rel)));
if (missing.length) {
  console.error('Portal integration verification failed. Missing required local portal sources:\n' + missing.join('\n'));
  process.exit(1);
}

const mainSource = readFileSync(resolve(process.cwd(), 'src/main.tsx'), 'utf8');
if (mainSource.includes('../../app/src/PortalApp') || mainSource.includes('../../app/src/index.css')) {
  console.error('Portal integration verification failed. src/main.tsx still imports app runtime directly.');
  process.exit(1);
}

console.log('Portal integration verification passed.');
