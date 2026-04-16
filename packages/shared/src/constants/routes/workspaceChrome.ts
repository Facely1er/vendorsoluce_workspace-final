import routes from '../../../routes.json';

const WR = routes.workspace as Record<string, string>;

/**
 * Exact paths that use the light marketing chrome (no workspace sidebar; marketing-oriented navbar).
 * Product routes under `routes.json` → `marketing` that are still in-app tools/programs must NOT be listed here.
 */
const MARKETING_ONLY_EXACT = new Set<string>([
  '/',
  '/pricing',
  '/checkout',
  '/contact',
  '/privacy',
  '/acceptable-use-policy',
  '/cookie-policy',
  '/master-privacy-policy',
  '/master-terms-of-service',
  '/download',
  '/templates',
  '/how-it-works',
  '/api-docs',
  '/integration-guides',
  '/hosting-options',
  '/demo',
  '/trial',
  '/dashboard-demo',
  '/vendor-portal',
  '/careers',
]);

function normalizePath(pathname: string): string {
  return pathname.replace(/\/+$/, '') || '/';
}

function isMarketingOnlyPath(path: string): boolean {
  if (path === '/signin' || path === '/signup' || path === '/reset-password') return true;
  if (MARKETING_ONLY_EXACT.has(path)) return true;
  if (path.startsWith('/templates/')) return true;
  return false;
}

/**
 * Routes that use the workspace shell: fixed sidebar, workspace-oriented navbar, and consistent in-app navigation.
 * Includes all product surfaces linked from the workspace sidebar/nav (tools, programs, assessments, etc.), not only `WR.*`.
 */
export function isWorkspaceAppPath(pathname: string): boolean {
  const path = normalizePath(pathname);

  if (path.startsWith('/admin')) return true;
  if (path === '/workspace' || path.startsWith('/workspace/')) return true;

  for (const p of Object.values(WR)) {
    if (p.includes(':')) continue;
    if (path === p || path.startsWith(`${p}/`)) return true;
  }

  if (isMarketingOnlyPath(path)) return false;

  return true;
}
