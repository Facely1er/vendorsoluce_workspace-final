/**
 * Enforces authenticated product surface layout consistency and blocks marketing component leakage.
 * - Workspace pages must use WorkspacePageShell (directly or via WorkspacePage) when using legacy container wrappers.
 * - Vendor portal assessment page must use its canonical container constant.
 * - Product task pages must not import marketing home sections.
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
  'packages/vendor-risk-portal/src/pages/portal/VendorAssessmentPortal.tsx',
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

function usesApprovedLayoutContract(text) {
  return (
    text.includes('components/vendorsoluce-intelligence/WorkspacePageShell') ||
    text.includes('<WorkspacePageShell') ||
    text.includes('components/workspace/WorkspacePage') ||
    text.includes('<WorkspacePage ') ||
    text.includes('PORTAL_PAGE_INNER_CLASS')
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

    const usesShell = usesApprovedLayoutContract(text);
    if (usesShell) continue;

    for (const { regex, reason } of FORBIDDEN_CONTAINER_PATTERNS) {
      if (regex.test(text)) {
        failures.push(`${rel}: ${reason} without approved workspace/portal layout contract.`);
      }
    }
  }
}

if (failures.length) {
  console.error('Workspace/portal layout governance failed:\n' + failures.join('\n'));
  process.exit(1);
}

console.log('Workspace/portal layout governance: no forbidden containers or marketing home imports in scoped product pages.');
