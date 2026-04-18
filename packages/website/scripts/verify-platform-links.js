#!/usr/bin/env node
/**
 * Standalone verification for public platform links in the packaged website.
 * Avoids monorepo assumptions so the static site can be pasted or deployed independently.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WEBSITE = path.resolve(__dirname, '..');
const FOOTER = path.join(WEBSITE, 'includes', 'footer.html');

const platformLinks = [
  { href: 'https://app.vendorsoluce.com/supply-chain-assessment', label: 'Supply Chain Assessment', type: 'app' },
  { href: 'https://app.vendorsoluce.com/vendors', label: 'Vendor Dashboard', type: 'app' },
  { href: 'https://www.vendorsoluce.com/radar/vendor-threat-radar.html', label: 'Vendor Threat Radar', type: 'static', file: 'radar/vendor-threat-radar.html' },
  { href: 'https://portal.vendorsoluce.com', label: 'Vendor Assurance Portal', type: 'portal' },
];

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function main() {
  let failed = 0;
  if (!fs.existsSync(FOOTER)) {
    console.error(`❌ Footer not found: ${FOOTER}`);
    process.exit(1);
  }

  const footerHtml = fs.readFileSync(FOOTER, 'utf8');
  console.log('Verifying website → platform links\n');
  console.log('Footer file:', FOOTER);
  console.log('');

  for (const link of platformLinks) {
    const hrefPattern = new RegExp(`href="${escapeRegex(link.href)}(?:\\?[^\"]*)?(?:#[^\"]*)?"`);
    const inFooter = hrefPattern.test(footerHtml);
    if (!inFooter) {
      console.log(`❌ ${link.label}: href="${link.href}" not found in footer`);
      failed++;
      continue;
    }

    if (link.type === 'static') {
      const staticPath = path.join(WEBSITE, link.file);
      if (!fs.existsSync(staticPath)) {
        console.log(`❌ ${link.label}: static file not found at ${staticPath}`);
        failed++;
      } else {
        console.log(`✅ ${link.label}: ${link.href} (static file exists)`);
      }
    } else {
      console.log(`✅ ${link.label}: ${link.href}`);
    }
  }

  console.log('');
  if (failed > 0) {
    console.log(`Result: ${failed} platform link(s) failed verification.`);
    process.exit(1);
  }
  console.log('Result: All platform footer links are valid.');
}

main();
