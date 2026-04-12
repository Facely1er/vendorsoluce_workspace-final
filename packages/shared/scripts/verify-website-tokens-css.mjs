/**
 * Ensures `packages/website/assets/css/tokens.css` matches `websiteTokensCssContract`
 * in `packages/shared/tailwind-colors.js` (canonical marketing / account CSS variables).
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { websiteTokensCssContract } from '../tailwind-colors.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '../../..');
const TOKENS_FILE = 'packages/website/assets/css/tokens.css';

function normalizeHex(hex) {
  if (!hex || typeof hex !== 'string') return '';
  let s = hex.trim().replace(/^#/, '');
  if (s.length === 3) {
    s = s
      .split('')
      .map((c) => c + c)
      .join('');
  }
  return '#' + s.toLowerCase();
}

function normalizeValue(val) {
  if (val == null) return '';
  let v = String(val).trim();
  if (v.includes('/*')) v = v.split('/*')[0].trim();
  if (/^#[0-9A-Fa-f]{3,8}$/.test(v)) return normalizeHex(v);
  return v;
}

function valuesMatch(expectedRaw, foundRaw) {
  const exp = normalizeValue(expectedRaw);
  const got = normalizeValue(foundRaw);
  if (exp === got) return true;
  if (/^#/.test(exp) || /^#/.test(got)) {
    return normalizeHex(exp) === normalizeHex(got);
  }
  return false;
}

function extractDeclarations(blockInner) {
  const decl = {};
  const re = /--([a-z0-9-]+)\s*:\s*([^;]+);/gi;
  let x;
  while ((x = re.exec(blockInner))) {
    const key = '--' + x[1].toLowerCase();
    let val = x[2].trim();
    if (val.includes('/*')) val = val.split('/*')[0].trim();
    decl[key] = val;
  }
  return decl;
}

function extractBlock(text, label) {
  let re;
  if (label === ':root') {
    re = /:root\s*\{([\s\S]*?)\}/;
  } else if (label === '.dark') {
    re = /\.dark\s*,\s*html\.dark\s*\{([\s\S]*?)\}/;
  } else {
    return null;
  }
  const m = text.match(re);
  return m ? m[1] : null;
}

const failures = [];
const file = resolve(repoRoot, TOKENS_FILE);

if (!existsSync(file)) {
  console.error(`Website tokens CSS verification failed: missing ${TOKENS_FILE}`);
  process.exit(1);
}

const text = readFileSync(file, 'utf8');

for (const [blockLabel, expectedMap] of Object.entries(websiteTokensCssContract)) {
  const inner = extractBlock(text, blockLabel);
  if (!inner) {
    failures.push(`${TOKENS_FILE}: could not find block for ${blockLabel}`);
    continue;
  }
  const decl = extractDeclarations(inner);
  for (const [cssVar, expectedRaw] of Object.entries(expectedMap)) {
    const found = decl[cssVar];
    if (found === undefined) {
      failures.push(`${TOKENS_FILE} (${blockLabel}): missing ${cssVar}`);
      continue;
    }
    if (!valuesMatch(expectedRaw, found)) {
      failures.push(`${TOKENS_FILE} (${blockLabel}): ${cssVar} is "${found}", expected "${expectedRaw}"`);
    }
  }
}

if (failures.length) {
  console.error('Website tokens CSS verification failed:\n' + failures.join('\n'));
  process.exit(1);
}

console.log('Website tokens CSS: tokens.css matches websiteTokensCssContract in tailwind-colors.js.');
