import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '../../..');
const checks = [
  ['packages/app/src/context/I18nContext.tsx', '../../../shared/src/context/I18nContext'],
  ['packages/app/src/context/ThemeContext.tsx', '../../../shared/src/context/ThemeContext'],
  ['packages/app/src/components/portal/PortalNav.tsx', '../../../../shared/src/components/portal/PortalNav'],
  ['packages/vendor-risk-portal/src/context/I18nContext.tsx', '../../../shared/src/context/I18nContext'],
  ['packages/vendor-risk-portal/src/context/ThemeContext.tsx', '../../../shared/src/context/ThemeContext'],
  ['packages/vendor-risk-portal/src/components/portal/PortalNav.tsx', '../../../../shared/src/components/portal/PortalNav'],
];
let ok = true;
for (const [file, needle] of checks) {
  const abs = resolve(root, file);
  if (!existsSync(abs)) {
    console.error(`Missing file: ${file}`);
    ok = false;
    continue;
  }
  const text = readFileSync(abs, 'utf8');
  if (!text.includes(needle)) {
    console.error(`Expected ${file} to re-export ${needle}`);
    ok = false;
  }
}
if (!ok) process.exit(1);
console.log('Shared runtime dedup verification passed.');
