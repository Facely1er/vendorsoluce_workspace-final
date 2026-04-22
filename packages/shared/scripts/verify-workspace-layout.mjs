/**
 * Enforces authenticated product surface layout consistency and blocks marketing component leakage.
 * - Workspace pages must use WorkspacePageShell (directly or via WorkspacePage) when using legacy container wrappers.
 * - Vendor portal assessment page must use its canonical container constant.
 * - Product task pages must not import marketing home sections.
 * - Workspace pages must use PanelCard instead of raw Card components for sections.
 * - Workspace pages must use approved spacing constants instead of ad-hoc classes.
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
  'packages/app/src/components/workspace/WorkspacePage.tsx',
  'packages/app/src/pages/workspace/DashboardDemoPage.tsx', // Re-export wrapper
  'packages/app/src/pages/workspace/VendorsPage.tsx', // Re-export wrapper
]);

/**
 * Pre-existing violations that have been catalogued and are awaiting migration.
 * Files here are exempt from WORKSPACE_PAGE_CHECKS only (not marketing/container checks).
 * Remove entries as each file is migrated. Do NOT add new entries — fix the file instead.
 */
const WORKSPACE_CHECKS_LEGACY = new Set([
]);

const EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx']);

const MARKETING_HOME_IMPORT = /from\s+['"][^'"]*components\/home\/[^'"]+['"]/;
const RAW_CARD_IMPORT = /from\s+['"][^'"]*components\/ui\/Card['"]/;
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

const WORKSPACE_PAGE_CHECKS = [
  {
    name: 'Raw Card usage',
    detect: (text, rel) => {
      // Allow Card in component files, but not in workspace page files
      if (!rel.includes('/pages/workspace/') && !rel.includes('/pages/programs/') && !rel.includes('/pages/tools/')) {
        return false;
      }
      return RAW_CARD_IMPORT.test(text) && text.includes('<Card');
    },
    message: 'uses raw Card component instead of PanelCard',
  },
  {
    name: 'Ad-hoc spacing',
    detect: (text, rel) => {
      // Check for ad-hoc spacing classes in workspace pages when not using approved constants
      if (!rel.includes('/pages/workspace/') && !rel.includes('/pages/programs/') && !rel.includes('/pages/tools/')) {
        return false;
      }
      const usesConstants = text.includes('WORKSPACE_PAGE_BODY_GRID_CLASS') ||
                           text.includes('WORKSPACE_PAGE_BODY_STACK_CLASS') ||
                           text.includes('WORKSPACE_PAGE_BODY_STACK_LOOSE_CLASS');
      // If using constants, allow ad-hoc spacing for nested elements
      if (usesConstants) return false;

      // Look for grid/flex containers with ad-hoc spacing at the page body level
      const hasAdHocSpacing = /className=["'][^"']*\b(space-y-6|space-y-8|gap-6|gap-8)\b[^"']*["']/.test(text);
      return hasAdHocSpacing && !usesConstants;
    },
    message: 'uses ad-hoc spacing classes instead of WORKSPACE_PAGE_BODY_*_CLASS constants',
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

    // Check for marketing component imports
    if (MARKETING_HOME_IMPORT.test(text)) {
      failures.push(`${rel}: imports marketing home component into workspace surface.`);
    }

    const usesShell = usesApprovedLayoutContract(text);

    // Check for forbidden container patterns (only if not using approved layout)
    if (!usesShell) {
      for (const { regex, reason } of FORBIDDEN_CONTAINER_PATTERNS) {
        if (regex.test(text)) {
          failures.push(`${rel}: ${reason} without approved workspace/portal layout contract.`);
        }
      }
    }

    // Run workspace-specific checks (even if using approved layout)
    // Files in WORKSPACE_CHECKS_LEGACY are pre-existing violations awaiting migration.
    if (!WORKSPACE_CHECKS_LEGACY.has(rel)) {
      for (const check of WORKSPACE_PAGE_CHECKS) {
        if (check.detect(text, rel)) {
          failures.push(`${rel}: ${check.message}`);
        }
      }
    }
  }
}

if (failures.length) {
  console.error('Workspace/portal layout governance failed:\n' + failures.join('\n'));
  console.error(`\nTotal violations: ${failures.length}`);
  process.exit(1);
}

if (WORKSPACE_CHECKS_LEGACY.size > 0) {
  console.warn(`⚠  Workspace layout governance: ${WORKSPACE_CHECKS_LEGACY.size} legacy file(s) exempted (awaiting migration). See WORKSPACE_CHECKS_LEGACY in verify-workspace-layout.mjs.`);
}
console.log('✓ Workspace/portal layout governance: all pages follow structure standards.');
