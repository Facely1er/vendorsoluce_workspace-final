/**
 * Verify internal links and pages for the VendorSoluce website.
 * Run from packages/website: node scripts/verify-links.js
 * Checks that every internal href (same-site .html) resolves to an existing file.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const websiteRoot = path.join(__dirname, '..');

// HTML files we treat as public pages (links to these must work)
const publicDirs = ['', 'legal', 'radar'];
const excludeDirs = ['includes', 'node_modules', 'homepage_files', 'test-csvs', 'scripts'];
const excludeFiles = [
  'test-radar.html',
  'test-radar-functional.html',
  'csv-test-harness.html',
  'force-dark.html',
  'vendor-inherent-risk-assessment-report-2026-03-11.html', // generated report sample
];

function findPublicHtmlFiles(dir, base = '', list = []) {
  const full = path.join(dir, base);
  if (!fs.existsSync(full)) return list;
  const entries = fs.readdirSync(full, { withFileTypes: true });
  for (const e of entries) {
    const rel = base ? `${base}/${e.name}` : e.name;
    if (e.isDirectory()) {
      if (!excludeDirs.some((x) => rel.startsWith(x) || rel === x)) findPublicHtmlFiles(dir, rel, list);
    } else if (e.name.endsWith('.html') && !excludeFiles.includes(e.name)) {
      list.push(rel);
    }
  }
  return list;
}

function extractInternalHrefs(html, fromFile) {
  const hrefRe = /href=["']([^"']+)["']/g;
  const out = new Set();
  let m;
  while ((m = hrefRe.exec(html)) !== null) {
    const href = m[1].trim();
    if (!href || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) continue;
    const hashIdx = href.indexOf('#');
    const pathPart = hashIdx >= 0 ? href.slice(0, hashIdx) : href;
    if (pathPart === '' || pathPart.startsWith('#')) continue; // hash-only or empty
    if (!pathPart.endsWith('.html')) continue; // only check .html same-site pages
    out.add(pathPart);
  }
  return out;
}

function resolveToFile(fromRel, href) {
  // href can be: "/index.html", "/legal/terms.html", "index.html", "../index.html", "legal/terms.html"
  const fromDir = path.dirname(fromRel);
  let target;
  if (href.startsWith('/')) {
    target = href.slice(1).replace(/^\//, '');
  } else {
    target = path.normalize(path.join(fromDir, href)).replace(/\\/g, '/');
  }
  if (!target.endsWith('.html') && target !== '') target = (target ? target + '/' : '') + 'index.html';
  return target;
}

const publicFiles = findPublicHtmlFiles(websiteRoot);
const allInternalLinks = new Map(); // file -> Set of resolved target paths

for (const rel of publicFiles) {
  const full = path.join(websiteRoot, rel);
  const html = fs.readFileSync(full, 'utf8');
  const hrefs = extractInternalHrefs(html, rel);
  const resolved = new Set();
  for (const h of hrefs) {
    if (h.startsWith('#')) continue;
    const resolvedPath = resolveToFile(rel, h);
    if (resolvedPath) resolved.add(resolvedPath);
  }
  if (resolved.size) allInternalLinks.set(rel, resolved);
}

// Include header and footer (they're embedded into pages)
for (const inc of ['includes/header.html', 'includes/footer.html']) {
  const full = path.join(websiteRoot, inc);
  if (!fs.existsSync(full)) continue;
  const html = fs.readFileSync(full, 'utf8');
  const hrefs = extractInternalHrefs(html, 'index.html'); // treat as from root
  const resolved = new Set();
  for (const h of hrefs) {
    if (h.startsWith('#')) continue;
    const resolvedPath = resolveToFile('index.html', h.startsWith('/') ? h : h);
    if (resolvedPath) resolved.add(resolvedPath);
  }
  allInternalLinks.set(inc, resolved);
}

const broken = [];
const checked = new Set();

for (const [from, targets] of allInternalLinks) {
  for (const t of targets) {
    if (checked.has(t)) continue;
    checked.add(t);
    const filePath = path.join(websiteRoot, t);
    if (!fs.existsSync(filePath)) {
      broken.push({ target: t, from });
    }
  }
}

// Also verify radar page links (e.g. /tutorial.html#step-radar)
const radarPath = path.join(websiteRoot, 'radar', 'vendor-threat-radar.html');
if (fs.existsSync(radarPath)) {
  const radarHtml = fs.readFileSync(radarPath, 'utf8');
  const radarHrefs = extractInternalHrefs(radarHtml, 'radar/placeholder.html');
  for (const h of radarHrefs) {
    if (h.startsWith('#')) continue;
    const resolvedPath = resolveToFile('radar/placeholder.html', h);
    const filePath = path.join(websiteRoot, resolvedPath);
    if (!fs.existsSync(filePath)) broken.push({ target: resolvedPath, from: 'radar/vendor-threat-radar.html' });
  }
}

if (broken.length > 0) {
  console.error('Broken internal links:\n');
  const byTarget = new Map();
  for (const { target, from } of broken) {
    if (!byTarget.has(target)) byTarget.set(target, []);
    byTarget.get(target).push(from);
  }
  for (const [target, froms] of byTarget) {
    console.error('  Missing file: ' + target);
    console.error('    Linked from: ' + froms.join(', '));
  }
  process.exit(1);
}

console.log('Link check: OK');
console.log('  Public HTML files: ' + publicFiles.length);
console.log('  Internal link targets checked: ' + checked.size);
