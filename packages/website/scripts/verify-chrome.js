/**
 * Verifies public HTML pages include the standard VendorSoluce chrome:
 * glass-nav header, canonical footer id, navigation.js.
 *
 * Excludes fragment templates, internal test harnesses, standalone reports,
 * and non-VendorSoluce product pages under steel/.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const websiteRoot = path.join(__dirname, '..');

const IGNORE_DIR_NAMES = new Set([
  'node_modules',
  '.git',
  'includes',
  'homepage_files',
  'test-csvs',
]);

/** Paths (posix, relative to website root) that intentionally omit full site chrome */
const ALLOWLIST_NO_CHROME = new Set([
  'steel/index.html',
  'vendor-portfolio-report.html',
  'vendor-inherent-risk-assessment-report-2026-03-11.html',
  // Redirect stub — meta http-equiv="refresh" sends users directly to the report; no nav/footer needed.
  'vendorExposureMap.html',
  // Standalone generated report document (same engine as vendor-portfolio-report.html).
  'radar/sample-portfolio-cscrm-report.html',
  'radar/verify-radar.html',
  'radar/test-radar.html',
  'radar/test-radar-functional.html',
  'radar/test-csvs/csv-test-harness.html',
  'radar/test-csvs/force-dark.html',
]);

function walkHtml(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    if (IGNORE_DIR_NAMES.has(name)) continue;
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) {
      walkHtml(full, out);
    } else if (name.endsWith('.html')) {
      out.push(full);
    }
  }
  return out;
}

function toPosixRel(filePath) {
  return path.relative(websiteRoot, filePath).split(path.sep).join('/');
}

let errors = 0;
const files = walkHtml(websiteRoot);

for (const file of files) {
  const rel = toPosixRel(file);
  if (ALLOWLIST_NO_CHROME.has(rel)) continue;

  const html = fs.readFileSync(file, 'utf-8');
  const hasNav = html.includes('glass-nav-vs');
  const hasFooter = /id="footer"/.test(html);
  const hasNavJs = html.includes('navigation.js');

  if (!hasNav || !hasFooter || !hasNavJs) {
    console.error(`[verify-chrome] ${rel}`);
    if (!hasNav) console.error('  missing: glass-nav-vs header');
    if (!hasFooter) console.error('  missing: footer id="footer"');
    if (!hasNavJs) console.error('  missing: navigation.js');
    errors++;
  }
}

if (errors) {
  console.error(`\nverify-chrome: ${errors} file(s) failed.`);
  process.exit(1);
}

const checked = files.filter((f) => !ALLOWLIST_NO_CHROME.has(toPosixRel(f))).length;
console.log(`verify-chrome: OK (${checked} pages checked, ${ALLOWLIST_NO_CHROME.size} allowlisted).`);
