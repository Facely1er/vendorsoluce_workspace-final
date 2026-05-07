#!/usr/bin/env node
/**
 * Static SEO audit for VendorSoluce authored HTML (source of truth).
 * Mirrors CyberCaution scripts/audit-static-seo.mjs rules: hybrid JSON-LD, URL alignment, tag counts.
 *
 * Usage: node scripts/audit-static-seo.mjs
 * Run from packages/website (or pass WEBSITE_DIR env).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WEBSITE_DIR = process.env.WEBSITE_DIR
  ? path.resolve(process.env.WEBSITE_DIR)
  : path.join(__dirname, '..');

const IN_SCOPE = [
  'index.html',
  'account.html',
  'contact.html',
  'download.html',
  'faq.html',
  'features.html',
  'how-it-works.html',
  'pricing.html',
  'trust.html',
  'tutorial.html',
  'best-practices.html',
  'vira-methodology.html',
  'assessment/index.html',
  'legal/index.html',
  'legal/terms.html',
  'legal/privacy-policy.html',
  'legal/cookie-policy.html',
  'legal/acceptable-use-policy.html',
  '404.html',
  'radar/vendor-threat-radar.html',
  'radar/vendor-inherent-risk-report.html',
];

/** SPA shell (same SEO baseline when served as entry HTML) */
const APP_INDEX = path.join(WEBSITE_DIR, '..', 'app', 'index.html');

const EXCLUDED = [
  'steel/index.html',
  'radar/test-radar.html',
  'radar/test-radar-functional.html',
  'radar/verify-radar.html',
  'radar/test-csvs/force-dark.html',
  'radar/test-csvs/csv-test-harness.html',
  'includes/head-ermits-global.html',
];

const ABS_URL = /^https:\/\/www\.vendorsoluce\.com(\/[^"'\s]*)?$/i;
const OG_IMAGE_OK = /^https:\/\/www\.vendorsoluce\.com\/social-preview\.(png|svg)$/i;
const PRODUCT_ROOT = 'https://www.vendorsoluce.com/';

function decodeEntities(text) {
  if (!text) return '';
  return String(text)
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&trade;/gi, '\u2122')
    .replace(/&reg;/gi, '\u00ae')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(parseInt(d, 10)));
}

function decodeEntitiesFully(text) {
  let t = String(text || '');
  let prev;
  do {
    prev = t;
    t = decodeEntities(t);
  } while (t !== prev);
  return t;
}

function normalizeTitlePlain(plain) {
  const t = plain.replace(/\s+/g, ' ').trim();
  if (/\|\s*ERMITS\s*$/i.test(t)) return t;
  return t ? `${t} | ERMITS` : 'VendorSoluce | ERMITS';
}

function resolvedJsonLdPageName(head) {
  const m = head.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const raw = m ? m[1].replace(/<[^>]*>/g, '').trim() : '';
  return normalizeTitlePlain(decodeEntitiesFully(raw));
}

function isHomepageCanonical(url) {
  try {
    const u = new URL(String(url).trim());
    return u.hostname === 'www.vendorsoluce.com' && u.pathname === '/';
  } catch {
    return false;
  }
}

function read(rel) {
  return fs.readFileSync(path.join(WEBSITE_DIR, rel), 'utf8');
}

function extractHead(html) {
  const m = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  return m ? m[1] : '';
}

function countInHead(head, re) {
  const m = head.match(re);
  return m ? m.length : 0;
}

function metaContents(head, attr, key) {
  const tags = head.match(/<meta\s+[^>]+>/gi) || [];
  const out = [];
  const keyRe = new RegExp(`\\b${attr}\\s*=\\s*["']${key.replace(/:/g, '\\:')}["']`, 'i');
  for (const tag of tags) {
    if (!keyRe.test(tag)) continue;
    const cm = tag.match(/\bcontent\s*=\s*["']([^"']*)["']/i);
    if (cm) out.push(cm[1]);
  }
  return out;
}

function twitterContents(head, tw) {
  const byName = metaContents(head, 'name', `twitter:${tw}`);
  if (byName.length) return byName;
  return metaContents(head, 'property', `twitter:${tw}`);
}

function linkCanonical(head) {
  const tags = head.match(/<link\s+[^>]+>/gi) || [];
  for (const tag of tags) {
    if (!/\brel\s*=\s*["']canonical["']/i.test(tag)) continue;
    const hm = tag.match(/\bhref\s*=\s*["']([^"']*)["']/i);
    if (hm) return hm[1];
  }
  return null;
}

function titleInner(head) {
  const m = head.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m ? m[1].replace(/\s+/g, ' ').trim() : '';
}

function jsonLdBlocks(head) {
  const blocks = [];
  const re = /<script\s+[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(head)) !== null) {
    blocks.push(m[1].trim());
  }
  return blocks;
}

function auditPage(rel, htmlOverride = null) {
  const issues = [];
  const warnings = [];
  let html;
  try {
    html = htmlOverride ?? read(rel);
  } catch {
    return { rel, ok: false, issues: ['file missing'], warnings: [] };
  }
  const head = extractHead(html);
  if (!head) {
    return { rel, ok: false, issues: ['no <head>'], warnings: [] };
  }

  const titles = countInHead(head, /<title\b/gi);
  if (titles !== 1) issues.push(`expected 1 <title>, found ${titles}`);

  const desc = metaContents(head, 'name', 'description');
  if (desc.length !== 1) issues.push(`expected 1 meta[name=description], found ${desc.length}`);

  const robots = metaContents(head, 'name', 'robots');
  if (robots.length !== 1) {
    issues.push(`robots: expected exactly 1, got ${JSON.stringify(robots)}`);
  } else if (rel === '404.html') {
    if (!/noindex/i.test(robots[0] || '')) {
      issues.push(`404.html robots should include noindex, got ${JSON.stringify(robots)}`);
    }
  } else if (!/index\s*,\s*follow/i.test(robots[0] || '')) {
    issues.push(`robots: expected "index, follow", got ${JSON.stringify(robots)}`);
  }

  const app = metaContents(head, 'name', 'application-name');
  if (app.length !== 1 || app[0] !== 'VendorSoluce') {
    issues.push(`application-name: expected VendorSoluce once, got ${JSON.stringify(app)}`);
  }

  for (const n of ['author', 'creator', 'publisher']) {
    const v = metaContents(head, 'name', n);
    if (v.length !== 1 || v[0] !== 'ERMITS') {
      issues.push(`meta[name=${n}]: expected ERMITS once, got ${JSON.stringify(v)}`);
    }
  }

  const ogType = metaContents(head, 'property', 'og:type');
  if (ogType.length !== 1 || ogType[0] !== 'website') {
    issues.push(`og:type: expected website once, got ${JSON.stringify(ogType)}`);
  }

  const ogSite = metaContents(head, 'property', 'og:site_name');
  if (ogSite.length !== 1 || ogSite[0] !== 'ERMITS') {
    issues.push(`og:site_name: expected ERMITS once, got ${JSON.stringify(ogSite)}`);
  }

  for (const k of ['og:title', 'og:description']) {
    const v = metaContents(head, 'property', k);
    if (v.length !== 1) issues.push(`${k}: expected exactly 1, found ${v.length}`);
  }

  const ogUrl = metaContents(head, 'property', 'og:url');
  if (ogUrl.length !== 1 || !ABS_URL.test(ogUrl[0])) {
    issues.push(`og:url: expected one www.vendorsoluce.com URL, got ${JSON.stringify(ogUrl)}`);
  }

  const ogImg = metaContents(head, 'property', 'og:image');
  if (ogImg.length !== 1 || !OG_IMAGE_OK.test(ogImg[0])) {
    issues.push(`og:image: expected social-preview png/svg on www.vendorsoluce.com, got ${JSON.stringify(ogImg)}`);
  }

  for (const k of ['card', 'title', 'description', 'url', 'image']) {
    const v = twitterContents(head, k);
    if (v.length !== 1) issues.push(`twitter:${k}: expected exactly 1, found ${v.length}`);
  }
  const twImg = twitterContents(head, 'image');
  if (twImg.length !== 1 || !OG_IMAGE_OK.test(twImg[0])) {
    issues.push(`twitter:image: expected social-preview png/svg, got ${JSON.stringify(twImg)}`);
  }

  const canonical = linkCanonical(head);
  if (!canonical || !ABS_URL.test(canonical)) {
    issues.push(`canonical: missing or not www.vendorsoluce.com, got ${JSON.stringify(canonical)}`);
  }

  const twUrl = twitterContents(head, 'url')[0];
  const ogU = ogUrl[0];
  if (canonical && ogU && canonical !== ogU) issues.push(`canonical !== og:url (${canonical} vs ${ogU})`);
  if (canonical && twUrl && canonical !== twUrl) issues.push(`canonical !== twitter:url (${canonical} vs ${twUrl})`);

  const t = titleInner(head);
  if (!t.includes('| ERMITS')) issues.push(`<title> should include "| ERMITS", got: ${t.slice(0, 120)}`);

  const ogTitle = metaContents(head, 'property', 'og:title')[0];
  const twTitle = twitterContents(head, 'title')[0];
  if (ogTitle && t && ogTitle !== t) issues.push('og:title should match <title> text (after whitespace normalize)');
  if (twTitle && t && twTitle !== t) issues.push('twitter:title should match <title> text');

  const jblocks = jsonLdBlocks(head);
  if (jblocks.length !== 1) issues.push(`expected 1 JSON-LD block, found ${jblocks.length}`);
  else {
    try {
      const node = JSON.parse(jblocks[0]);
      const home = canonical && isHomepageCanonical(canonical);

      if (home) {
        if (node['@type'] !== 'SoftwareApplication') {
          issues.push('homepage JSON-LD @type should be SoftwareApplication');
        }
        if (node.url !== PRODUCT_ROOT) {
          issues.push(`homepage JSON-LD url should be ${PRODUCT_ROOT}`);
        }
        if (node.publisher?.name !== 'ERMITS') {
          issues.push('homepage JSON-LD publisher.name should be ERMITS');
        }
        if (!node.publisher?.url || !String(node.publisher.url).includes('ermits.com')) {
          issues.push('homepage JSON-LD publisher.url should reference ermits.com');
        }
      } else {
        if (node['@type'] !== 'WebPage') {
          issues.push('inner page JSON-LD @type should be WebPage');
        }
        if (node.url !== canonical) {
          issues.push(`WebPage.url must equal canonical (${JSON.stringify(node.url)} vs ${JSON.stringify(canonical)})`);
        }
        const expectName = resolvedJsonLdPageName(head);
        if (node.name !== expectName) {
          issues.push(`WebPage.name should match resolved <title> (${JSON.stringify(node.name)} vs ${JSON.stringify(expectName)})`);
        }
        if (node.publisher?.name !== 'ERMITS') {
          issues.push('WebPage.publisher.name should be ERMITS');
        }
        const part = node.isPartOf;
        if (!part || part['@type'] !== 'WebSite') {
          issues.push('JSON-LD isPartOf should be WebSite');
        } else {
          if (part.name !== 'VendorSoluce') {
            issues.push(`isPartOf.name should be VendorSoluce, got ${JSON.stringify(part.name)}`);
          }
          if (part.url !== PRODUCT_ROOT) {
            issues.push(`isPartOf.url should be ${PRODUCT_ROOT}`);
          }
        }
        const me = node.mainEntity;
        if (!me || me['@type'] !== 'SoftwareApplication') {
          issues.push('mainEntity should be SoftwareApplication');
        } else {
          if (me.url !== PRODUCT_ROOT) {
            issues.push(`mainEntity.url must be ${PRODUCT_ROOT}`);
          }
          if (me.publisher?.name !== 'ERMITS') {
            issues.push('mainEntity.publisher.name should be ERMITS');
          }
          if (!me.publisher?.url || !String(me.publisher.url).includes('ermits.com')) {
            issues.push('mainEntity.publisher.url should reference ermits.com');
          }
        }
      }
    } catch {
      issues.push('JSON-LD is not valid JSON');
    }
  }

  const twCard = twitterContents(head, 'card')[0];
  if (twCard === 'summary_large_image' && !twImg[0]) {
    issues.push('twitter:card summary_large_image requires image');
  }

  return { rel, ok: issues.length === 0, issues, warnings };
}

function main() {
  console.log('VendorSoluce static SEO audit (authored source)');
  console.log('Root:', WEBSITE_DIR);
  console.log('');

  const missing = IN_SCOPE.filter((r) => !fs.existsSync(path.join(WEBSITE_DIR, r)));
  if (missing.length) {
    console.error('Missing in-scope files:', missing.join(', '));
    process.exit(1);
  }

  let failed = 0;

  for (const rel of IN_SCOPE) {
    const r = auditPage(rel);
    if (!r.ok) {
      failed++;
      console.log(`FAIL  ${rel}`);
      r.issues.forEach((i) => console.log(`       - ${i}`));
    } else {
      console.log(`OK    ${rel}`);
    }
  }

  if (fs.existsSync(APP_INDEX)) {
    const appHtml = fs.readFileSync(APP_INDEX, 'utf8');
    const r = auditPage('../app/index.html', appHtml);
    if (!r.ok) {
      failed++;
      console.log('FAIL  ../app/index.html (packages/app)');
      r.issues.forEach((i) => console.log(`       - ${i}`));
    } else {
      console.log('OK    ../app/index.html (packages/app)');
    }
  } else {
    console.log('SKIP  ../app/index.html (missing)');
  }

  console.log('');
  console.log('Excluded from full SEO requirements:');
  for (const x of EXCLUDED) {
    const p = path.join(WEBSITE_DIR, x);
    console.log(`  - ${x} ${fs.existsSync(p) ? '' : '(missing)'}`);
  }

  if (failed > 0) {
    console.log(`\n${failed} page(s) failed.`);
    process.exit(1);
  }
  console.log('\nAll in-scope pages passed.');
  process.exit(0);
}

main();
