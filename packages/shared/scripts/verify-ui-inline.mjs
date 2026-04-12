/**
 * Blocks raw hex color literals and Tailwind arbitrary color classes in app/portal source.
 * Allowed sinks: shared tailwind-colors, pdfHtmlPalette, inlineUiTokens (includes marketing email tokens), plus TemplatePreviewPage.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const repoRoot = resolve(__dirname, '../../..');

const ALLOWLIST = new Set([
  'packages/shared/tailwind-colors.js',
  'packages/app/src/utils/pdfHtmlPalette.ts',
  'packages/app/src/theme/inlineUiTokens.ts',
  'packages/app/src/pages/public/TemplatePreviewPage.tsx',
]);

const SCAN_ROOTS = ['packages/app/src', 'packages/vendor-risk-portal/src'];
const EXT = new Set(['.ts', '.tsx', '.js', '.jsx']);

const hexLiteral = /\b#[0-9A-Fa-f]{3,8}\b/;
const tailwindArbitraryColor = /\[[^\]\n]*#[0-9A-Fa-f]{3,8}[^\]\n]*\]/;

function stripComments(s) {
  return s
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');
}

function walk(dir, out) {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === 'dist') continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (EXT.has(name.slice(name.lastIndexOf('.')))) out.push(p);
  }
}

const failures = [];

for (const rootRel of SCAN_ROOTS) {
  const root = resolve(repoRoot, rootRel);
  const files = [];
  walk(root, files);
  for (const file of files) {
    const rel = relative(repoRoot, file).split('\\').join('/');
    if (rel.includes('/test/') || rel.endsWith('.test.ts') || rel.endsWith('.test.tsx')) continue;
    if (ALLOWLIST.has(rel)) continue;

    let text = readFileSync(file, 'utf8');
    text = stripComments(text);
    if (hexLiteral.test(text)) {
      failures.push(`${rel}: hex color literal — use shared/tailwind-colors or packages/app/src/theme/inlineUiTokens.ts`);
    }
    if (tailwindArbitraryColor.test(text)) {
      failures.push(`${rel}: Tailwind arbitrary color class [..#..] — use semantic tokens`);
    }
  }
}

if (failures.length) {
  console.error('UI inline color governance failed:\n' + failures.join('\n'));
  process.exit(1);
}

console.log('UI inline color governance: no forbidden hex or arbitrary color classes in scanned sources.');
