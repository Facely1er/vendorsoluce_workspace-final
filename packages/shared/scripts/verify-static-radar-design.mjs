/**
 * Ensures static radar HTML/CSS and the marketing site Tailwind input mirror
 * `packages/shared/tailwind-colors.js` (`vendorsoluceColors`) and do not
 * reintroduce legacy Material palette hex values.
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { vendorsoluceColors } from '../tailwind-colors.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '../../..');

/** CSS custom property name → key in vendorsoluceColors */
const ROOT_VARS = [
  '--vendorsoluce-green',
  '--vendorsoluce-light-green',
  '--vendorsoluce-dark-green',
  '--vendorsoluce-pale-green',
  '--vendorsoluce-navy',
  '--vendorsoluce-teal',
  '--vendorsoluce-blue',
  '--neutral-gray',
];

/** Pre-Material-alignment greens / blues — must not appear in production radar assets */
const LEGACY_HEX = [
  /#2e7d32\b/i,
  /#4caf50\b/i,
  /#1b5e20\b/i,
  /#1a2e1a\b/i,
  /#009688\b/i,
  /#2196f3\b/i,
];

const RADAR_ASSETS = [
  'packages/website/radar/vendor-threat-radar.html',
  'packages/website/radar/vendor-threat-radar.css',
  'packages/website/radar/vendor-inherent-risk-report.html',
];

/** Marketing `src/tailwind.css` — subset of brand tokens (footer / global utilities). */
const WEBSITE_TAILWIND_SRC = 'packages/website/src/tailwind.css';
const WEBSITE_ROOT_VARS = [
  '--vendorsoluce-green',
  '--vendorsoluce-light-green',
  '--vendorsoluce-dark-green',
  '--vendorsoluce-pale-green',
];

function normalizeHex(hex) {
  if (!hex || typeof hex !== 'string') return '';
  let s = hex.trim().replace(/^#/, '');
  if (s.length === 3) {
    s = s
      .split('')
      .map((c) => c + c)
      .join('');
  }
  return '#' + s.toUpperCase();
}

function extractRootDeclarations(html) {
  const m = html.match(/:root\s*\{([\s\S]*?)\}/);
  if (!m) return null;
  const decl = {};
  const re = /--([a-z0-9-]+)\s*:\s*([^;]+);/gi;
  let x;
  while ((x = re.exec(m[1]))) {
    const key = '--' + x[1].toLowerCase();
    let val = x[2].trim();
    if (val.includes('/*')) val = val.split('/*')[0].trim();
    decl[key] = val;
  }
  return decl;
}

const failures = [];

for (const rel of RADAR_ASSETS) {
  const file = resolve(repoRoot, rel);
  if (!existsSync(file)) {
    failures.push(`Missing ${rel}`);
    continue;
  }
  const text = readFileSync(file, 'utf8');

  if (rel.endsWith('.html')) {
    const decl = extractRootDeclarations(text);
    if (!decl) {
      failures.push(`${rel}: expected a :root { ... } block with design tokens`);
      continue;
    }
    for (const cssVar of ROOT_VARS) {
      const mapKey = cssVar.slice(2);
      const expected = vendorsoluceColors[mapKey];
      if (!expected) {
        failures.push(`${rel}: internal script error — no token for ${cssVar}`);
        continue;
      }
      const found = decl[cssVar];
      if (!found) {
        failures.push(`${rel}: missing ${cssVar} in :root (must match tailwind-colors.js)`);
        continue;
      }
      if (normalizeHex(found) !== normalizeHex(expected)) {
        failures.push(
          `${rel}: ${cssVar} is ${found}, expected ${expected} (packages/shared/tailwind-colors.js)`,
        );
      }
    }
  }

  for (const pattern of LEGACY_HEX) {
    if (pattern.test(text)) {
      failures.push(
        `${rel}: legacy hex matching ${pattern} — use tokens from packages/shared/tailwind-colors.js`,
      );
      break;
    }
  }
}

{
  const rel = WEBSITE_TAILWIND_SRC;
  const file = resolve(repoRoot, rel);
  if (!existsSync(file)) {
    failures.push(`Missing ${rel}`);
  } else {
    const text = readFileSync(file, 'utf8');
    const decl = extractRootDeclarations(text);
    if (!decl) {
      failures.push(`${rel}: expected a :root { ... } block with design tokens`);
    } else {
      for (const cssVar of WEBSITE_ROOT_VARS) {
        const mapKey = cssVar.slice(2);
        const expected = vendorsoluceColors[mapKey];
        if (!expected) {
          failures.push(`${rel}: internal script error — no token for ${cssVar}`);
          continue;
        }
        const found = decl[cssVar];
        if (!found) {
          failures.push(`${rel}: missing ${cssVar} in :root (must match tailwind-colors.js)`);
          continue;
        }
        if (normalizeHex(found) !== normalizeHex(expected)) {
          failures.push(
            `${rel}: ${cssVar} is ${found}, expected ${expected} (packages/shared/tailwind-colors.js)`,
          );
        }
      }
    }
    for (const pattern of LEGACY_HEX) {
      if (pattern.test(text)) {
        failures.push(
          `${rel}: legacy hex matching ${pattern} — use tokens from packages/shared/tailwind-colors.js`,
        );
        break;
      }
    }
  }
}

if (failures.length) {
  console.error('Static design token verification failed:\n' + failures.join('\n'));
  process.exit(1);
}

console.log(
  'Static design tokens: radar + website tailwind :root match tailwind-colors.js; no legacy Material hex in checked assets.',
);
