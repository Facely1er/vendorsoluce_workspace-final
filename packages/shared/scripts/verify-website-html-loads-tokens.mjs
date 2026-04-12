/**
 * Ensures every production static HTML page under packages/website links
 * `assets/css/tokens.css` (semantic design tokens). Excludes embedded fragments
 * and local dev/test harness HTML that intentionally diverge.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const repoRoot = join(__dirname, '../../..');
const websiteRoot = join(repoRoot, 'packages/website');

/** Relative to packages/website — skip embedded fragments only (full pages must link tokens.css) */
function shouldSkip(relPosix) {
  if (relPosix.startsWith('includes/')) return true;
  if (relPosix.endsWith('/header-template.html') || relPosix.endsWith('/footer-template.html')) return true;
  return false;
}

function walkHtml(dir, out) {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === 'dist') continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walkHtml(p, out);
    else if (name.endsWith('.html')) out.push(p);
  }
}

const files = [];
walkHtml(websiteRoot, files);

const linkTokens = /<link\b[^>]*\bhref\s*=\s*["'][^"']*tokens\.css[^"']*["'][^>]*>/i;

const failures = [];
for (const file of files) {
  const rel = relative(websiteRoot, file).split('\\').join('/');
  if (shouldSkip(rel)) continue;
  const text = readFileSync(file, 'utf8');
  if (!linkTokens.test(text)) {
    failures.push(`packages/website/${rel}: missing <link> to tokens.css (semantic design tokens)`);
  }
}

if (failures.length) {
  console.error('Website HTML token link verification failed:\n' + failures.join('\n'));
  process.exit(1);
}

console.log(
  'Website HTML: all scoped static pages link tokens.css (packages/shared/scripts/verify-website-html-loads-tokens.mjs).',
);
