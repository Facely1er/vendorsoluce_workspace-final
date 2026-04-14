#!/usr/bin/env node
/**
 * Verifies that website footer links to the platform have valid targets:
 * - App/public/workspace routes exist in packages/shared/routes.json
 * - Static file /radar/vendor-threat-radar.html exists in website
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ROOT = path.resolve(__dirname, '../../..');
const WEBSITE = path.join(ROOT, 'packages/website');
const SHARED_ROUTES = path.join(ROOT, 'packages/shared/routes.json');

const platformLinks = [
  { href: 'https://app.vendorsoluce.com/supply-chain-assessment', label: 'Supply Chain Assessment', type: 'app' },
  { href: 'https://app.vendorsoluce.com/vendors', label: 'Vendor Dashboard', type: 'app' },
  { href: 'https://www.vendorsoluce.com/radar/vendor-threat-radar.html', label: 'Vendor Threat Radar', type: 'static' },
  { href: 'https://www.portal.vendorsoluce.com', label: 'Vendor Assurance Portal', type: 'portal' },
];

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function main() {
  let failed = 0;
  const footerPath = path.join(WEBSITE, 'includes/footer.html');
  const footerHtml = fs.readFileSync(footerPath, 'utf8');
  const routeConfig = JSON.parse(fs.readFileSync(SHARED_ROUTES, 'utf8'));
  const knownRoutes = new Set([
    ...Object.values(routeConfig.marketing || {}),
    ...Object.values(routeConfig.workspace || {}),
    ...Object.values(routeConfig.auth || {}),
    ...Object.values(routeConfig.portal || {}),
  ]);

  console.log('Verifying website → platform links\n');
  console.log('Footer file:', footerPath);
  console.log('');

  for (const link of platformLinks) {
    const hrefPattern = new RegExp(`href="${escapeRegex(link.href)}(?:\\?[^\"]*)?(?:#[^\"]*)?"`);
    const inFooter = hrefPattern.test(footerHtml);
    if (!inFooter) {
      console.log(`❌ ${link.label}: href="${link.href}" not found in footer`);
      failed++;
      continue;
    }

    if (link.type === 'app') {
      const pathPart = link.href.replace(/^https:\/\/[^/]+/, '') || '/';
      if (!knownRoutes.has(pathPart)) {
        console.log(`❌ ${link.label}: App has no route for "${pathPart}"`);
        failed++;
      } else {
        console.log(`✅ ${link.label}: ${link.href} (route manifest entry exists)`);
      }
    } else if (link.type === 'static') {
      const staticPath = path.join(WEBSITE, new URL(link.href).pathname.replace(/^\//, ''));
      if (!fs.existsSync(staticPath)) {
        console.log(`❌ ${link.label}: static file not found at ${staticPath}`);
        failed++;
      } else {
        console.log(`✅ ${link.label}: ${link.href} (static file exists)`);
      }
    } else {
      console.log(`✅ ${link.label}: ${link.href} (portal)`);
    }
  }

  console.log('');
  if (failed > 0) {
    console.log(`Result: ${failed} link(s) failed verification.`);
    process.exit(1);
  }
  console.log('Result: All platform links are valid.');
}

main();
