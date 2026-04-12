import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const targets = [
  'src/PortalApp.tsx',
  'src/components/common/DemoModeBanner.tsx',
  'src/components/common/OfflineDetector.tsx',
  'src/components/common/TrialModeBanner.tsx',
  'src/components/layout/MainWrapper.tsx',
  'src/components/layout/Navbar.tsx',
  'src/pages/portal/PortalHome.tsx',
  'src/pages/portal/PortalDemo.tsx',
];
const forbidden = ['top-16', 'pt-16'];
const failures = [];
for (const rel of targets) {
  const file = resolve(root, rel);
  if (!existsSync(file)) continue;
  const text = readFileSync(file, 'utf8');
  for (const token of forbidden) {
    if (text.includes(token)) failures.push(`${rel}: forbidden shell literal \"${token}\"`);
  }
}
if (failures.length) {
  console.error('Shell contract verification failed:\n' + failures.join('\n'));
  process.exit(1);
}
console.log('Shell contract verification passed.');
