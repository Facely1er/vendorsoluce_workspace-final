/**
 * Enforces workspace page layout consistency and blocks marketing component leakage.
 * - Workspace pages must use WorkspacePageShell (directly or via WorkspacePage) when using legacy container wrappers.
 * - Workspace pages must not import marketing home sections.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const repoRoot = resolve(__dirname, '../../..');

const SCAN_ROOTS = [
  'packages/app/src/pages/workspace',
  'packages/app/src/pages/programs',
  'packages/app/src/pages/tools',
  'packages/app/src/pages/assessments',
  'packages/app/src/pages/admin',
  'packages/app/src/pages/public/LicensePage.tsx',
];

const ALLOWLIST = new Set([
  'packages/app/src/components/vendorsoluce-intelligence/WorkspacePageShell.tsx',
]);

const EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx']);

const MARKETING_HOME_IMPORT = /from\s+['"][^'"]*components\/home\/[^'"]+['"]/;
const FORBIDDEN_CONTAINER_PATTERNS = [
  {
    regex: /max-w-(?:[2-7]xl|screen-[a-z]+)[^"'`\n]*\bmx-auto\b[^"'`\n]*\bpx-4\b[^"'`\n]*\bsm:px-6\b[^"'`\n]*\blg:px-8\b/,
    reason: 'legacy page container (max-w + mx-auto + px-4/sm:px-6/lg:px-8)',
  },
  {
    regex: /\bpy-16\b/,
    reason: 'marketing-scale vertical spacing (py-16)',
  },
];

function walk(dir, out) {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === 'dist') continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (EXTENSIONS.has(name.slice(name.lastIndexOf('.')))) out.push(p);
  }
}

function isWorkspaceShellFile(text) {
  return (
    text.includes('components/vendorsoluce-intelligence/WorkspacePageShell') ||
    text.includes('<WorkspacePageShell') ||
    text.includes('components/workspace/WorkspacePage') ||
    text.includes('<WorkspacePage ')
  );
}

const failures = [];

for (const rootRel of SCAN_ROOTS) {
  const absoluteRoot = resolve(repoRoot, rootRel);
  const files = [];
  const st = statSync(absoluteRoot);
  if (st.isDirectory()) {
    walk(absoluteRoot, files);
  } else {
    files.push(absoluteRoot);
  }

  for (const file of files) {
    const rel = relative(repoRoot, file).split('\\').join('/');
    if (ALLOWLIST.has(rel)) continue;

    const text = readFileSync(file, 'utf8');

    if (MARKETING_HOME_IMPORT.test(text)) {
      failures.push(`${rel}: imports marketing home component into workspace surface.`);
    }

    const usesShell = isWorkspaceShellFile(text);
    if (usesShell) continue;

    for (const { regex, reason } of FORBIDDEN_CONTAINER_PATTERNS) {
      if (regex.test(text)) {
        failures.push(`${rel}: ${reason} without WorkspacePageShell/WorkspacePage.`);
      }
    }
  }
}

if (failures.length) {
  console.error('Workspace layout governance failed:\n' + failures.join('\n'));
  process.exit(1);
}

console.log('Workspace layout governance: no forbidden workspace containers or marketing home imports in workspace pages.');
