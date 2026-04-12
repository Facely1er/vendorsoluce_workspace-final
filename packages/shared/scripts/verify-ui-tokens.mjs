/**
 * Ensures Tailwind configs for app, website, and portal consume shared tokens only.
 * Hex literals belong in packages/shared/tailwind-colors.js — not duplicated in consumers.
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '../../..');

const consumers = [
  'packages/app/tailwind.config.js',
  'packages/website/tailwind.config.js',
  'packages/vendor-risk-portal/tailwind.config.js',
];

const importPattern = /from\s+['"]shared\/tailwind-config['"]/;
/** Hex colors in consumer configs (forbidden — use shared/tailwind-colors.js) */
const hexLiteral = /#[0-9A-Fa-f]{3,8}\b/;

const failures = [];

for (const rel of consumers) {
  const file = resolve(repoRoot, rel);
  if (!existsSync(file)) {
    failures.push(`Missing ${rel}`);
    continue;
  }
  let text = readFileSync(file, 'utf8');
  if (!importPattern.test(text)) {
    failures.push(`${rel}: must import from 'shared/tailwind-config'`);
  }
  text = text.replace(/\/\/.*$/gm, '');
  if (hexLiteral.test(text)) {
    failures.push(
      `${rel}: hex color literals are not allowed; add or change tokens in packages/shared/tailwind-colors.js`,
    );
  }
}

if (failures.length) {
  console.error('UI token governance failed:\n' + failures.join('\n'));
  process.exit(1);
}

console.log('UI token governance: tailwind configs consume shared tokens only.');
