#!/usr/bin/env node
/**
 * One-shot / repeatable normalization of static <head> SEO + JSON-LD for VendorSoluce website.
 * Run from packages/website: node scripts/normalize-static-seo.mjs
 *
 * Preserves non-SEO head content (scripts, styles, favicons). Rewrites canonical/OG/Twitter/JSON-LD
 * and re-appends includes/head-ermits-global.html (meta bundle only).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WEBSITE_ROOT = path.join(__dirname, '..');
const BUNDLE_PATH = path.join(WEBSITE_ROOT, 'includes', 'head-ermits-global.html');
const BUNDLE = fs.readFileSync(BUNDLE_PATH, 'utf8').trimEnd() + '\n';

const PRODUCT_ROOT = 'https://www.vendorsoluce.com/';
const SA_DESC =
  'Vendor risk intelligence workspace for third-party risk review, dependency visibility, and supply chain assurance.';

/** Canonical host — https://www.vendorsoluce.com (homepage trailing slash). */
const PAGES = [
  { rel: 'index.html', canonical: 'https://www.vendorsoluce.com/', home: true, image: 'https://www.vendorsoluce.com/social-preview.png' },
  { rel: 'pricing.html', canonical: 'https://www.vendorsoluce.com/pricing', image: 'https://www.vendorsoluce.com/social-preview.svg' },
  { rel: 'tutorial.html', canonical: 'https://www.vendorsoluce.com/tutorial', image: 'https://www.vendorsoluce.com/social-preview.svg' },
  { rel: 'trust.html', canonical: 'https://www.vendorsoluce.com/trust', image: 'https://www.vendorsoluce.com/social-preview.svg' },
  { rel: 'how-it-works.html', canonical: 'https://www.vendorsoluce.com/how-it-works', image: 'https://www.vendorsoluce.com/social-preview.svg' },
  { rel: 'features.html', canonical: 'https://www.vendorsoluce.com/features', image: 'https://www.vendorsoluce.com/social-preview.svg' },
  { rel: 'faq.html', canonical: 'https://www.vendorsoluce.com/faq', image: 'https://www.vendorsoluce.com/social-preview.svg' },
  { rel: 'download.html', canonical: 'https://www.vendorsoluce.com/download', image: 'https://www.vendorsoluce.com/social-preview.svg' },
  { rel: 'contact.html', canonical: 'https://www.vendorsoluce.com/contact', image: 'https://www.vendorsoluce.com/social-preview.svg' },
  { rel: 'best-practices.html', canonical: 'https://www.vendorsoluce.com/best-practices', image: 'https://www.vendorsoluce.com/social-preview.svg' },
  { rel: 'vira-methodology.html', canonical: 'https://www.vendorsoluce.com/vira-methodology', image: 'https://www.vendorsoluce.com/social-preview.svg' },
  { rel: 'account.html', canonical: 'https://www.vendorsoluce.com/account', image: 'https://www.vendorsoluce.com/social-preview.svg' },
  { rel: 'assessment/index.html', canonical: 'https://www.vendorsoluce.com/assessment/', image: 'https://www.vendorsoluce.com/social-preview.svg' },
  { rel: 'legal/index.html', canonical: 'https://www.vendorsoluce.com/legal/', image: 'https://www.vendorsoluce.com/social-preview.svg' },
  { rel: 'legal/terms.html', canonical: 'https://www.vendorsoluce.com/legal/terms', image: 'https://www.vendorsoluce.com/social-preview.svg' },
  { rel: 'legal/privacy-policy.html', canonical: 'https://www.vendorsoluce.com/legal/privacy-policy', image: 'https://www.vendorsoluce.com/social-preview.svg' },
  { rel: 'legal/cookie-policy.html', canonical: 'https://www.vendorsoluce.com/legal/cookie-policy', image: 'https://www.vendorsoluce.com/social-preview.svg' },
  { rel: 'legal/acceptable-use-policy.html', canonical: 'https://www.vendorsoluce.com/legal/acceptable-use-policy', image: 'https://www.vendorsoluce.com/social-preview.svg' },
  { rel: '404.html', canonical: 'https://www.vendorsoluce.com/404.html', image: 'https://www.vendorsoluce.com/social-preview.png', robots: 'noindex, nofollow' },
  { rel: 'radar/vendor-threat-radar.html', canonical: 'https://www.vendorsoluce.com/radar/vendor-threat-radar', image: 'https://www.vendorsoluce.com/social-preview.svg' },
  { rel: 'radar/vendor-inherent-risk-report.html', canonical: 'https://www.vendorsoluce.com/radar/vendor-inherent-risk-report', image: 'https://www.vendorsoluce.com/social-preview.svg' },
];

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

function resolvedJsonLdPageName(titleInnerRaw) {
  const raw = titleInnerRaw.replace(/<[^>]*>/g, '').trim();
  return normalizeTitlePlain(decodeEntitiesFully(raw));
}

/** Escape only what breaks double-quoted HTML attributes; keep entities like &trade; aligned with <title>. */
function escapeAttr(value) {
  return String(value).replace(/"/g, '&quot;');
}

function stripSeoFromHeadInner(inner) {
  let h = inner;
  h = h.replace(/\r\n/g, '\n');
  h = h.replace(/\n?<!-- VSS static SEO:[\s\S]*?<\/script>\s*/gi, '');
  h = h.replace(/\n?<!-- ERMITS global SEO bundle:[\s\S]*?<meta\s+name=["']publisher["']\s+content=["']ERMITS["'][^>]*>\s*/gi, '');
  h = h.replace(/<link[^>]*\brel=["']canonical["'][^>]*>\s*/gi, '');
  h = h.replace(/<meta[^>]*\bproperty=["']og:[^"']+["'][^>]*>\s*/gi, '');
  h = h.replace(/<meta[^>]*\bcontent=["'][^"']*["']\s+property=["']og:[^"']+["'][^>]*>\s*/gi, '');
  h = h.replace(/<meta[^>]*\bname=["']twitter:[^"']+["'][^>]*>\s*/gi, '');
  h = h.replace(/<meta[^>]*\bcontent=["'][^"']*["']\s+name=["']twitter:[^"']+["'][^>]*>\s*/gi, '');
  h = h.replace(/<script[^>]*\btype=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>\s*/gi, '');
  h = h.replace(/\n?\s*<!-- Open Graph[^>]*-->\s*/gi, '');
  h = h.replace(/\n?\s*<!-- Twitter[^>]*-->\s*/gi, '');
  h = h.replace(/\n?\s*<!-- Canonical[^\n]*\n?/gi, '');
  return h;
}

function extractTitleInner(headInner) {
  const m = headInner.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m ? m[1].trim() : '';
}

function extractMetaDescription(headInner) {
  let m = headInner.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i);
  if (m) return m[1];
  m = headInner.match(/<meta\s+content=["']([^"']*)["']\s+name=["']description["']/i);
  return m ? m[1] : '';
}

function ensureRobots(headInner, robotsContent) {
  const want = robotsContent || 'index, follow';
  let h = headInner.replace(/<meta\s+name=["']robots["'][^>]*>\s*/gi, '');
  const insertAfter = /<meta\s+name=["']viewport["'][^>]*>/i;
  if (insertAfter.test(h)) {
    return h.replace(insertAfter, (m) => `${m}\n  <meta name="robots" content="${want}">\n`);
  }
  const charset = /<meta\s+charset[^>]*>/i;
  if (charset.test(h)) {
    return h.replace(charset, (m) => `${m}\n  <meta name="robots" content="${want}">\n`);
  }
  return h.replace(/<head[^>]*>/i, (m) => `${m}\n  <meta name="robots" content="${want}">\n`);
}

function buildJsonLd({ home, canonical, titleInnerRaw, descForJson }) {
  if (home) {
    const node = {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'VendorSoluce',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      description: SA_DESC,
      url: PRODUCT_ROOT,
      publisher: { '@type': 'Organization', name: 'ERMITS', url: 'https://ermits.com/' },
    };
    return JSON.stringify(node, null, 2);
  }
  const pageName = resolvedJsonLdPageName(titleInnerRaw);
  const node = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: pageName,
    url: canonical,
    publisher: { '@type': 'Organization', name: 'ERMITS', url: 'https://ermits.com/' },
    isPartOf: { '@type': 'WebSite', name: 'VendorSoluce', url: PRODUCT_ROOT },
    mainEntity: {
      '@type': 'SoftwareApplication',
      name: 'VendorSoluce',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      description: SA_DESC,
      url: PRODUCT_ROOT,
      publisher: { '@type': 'Organization', name: 'ERMITS', url: 'https://ermits.com/' },
    },
  };
  return JSON.stringify(node, null, 2);
}

function buildSeoBlock({ canonical, titleInnerRaw, metaDesc, image, home, robots }) {
  const titleForMeta = titleInnerRaw.replace(/\s+/g, ' ').trim();
  const desc = metaDesc.trim();
  const escTitle = escapeAttr(titleForMeta);
  const escDesc = escapeAttr(desc);
  const escCanon = escapeAttr(canonical);
  const escImg = escapeAttr(image);
  const twCard = 'summary_large_image';
  const jsonLd = buildJsonLd({ home, canonical, titleInnerRaw, descForJson: desc });

  return `<!-- VSS static SEO: canonical + Open Graph + Twitter + JSON-LD (ERMITS baseline) -->
<link rel="canonical" href="${escCanon}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="ERMITS">
<meta property="og:title" content="${escTitle}">
<meta property="og:description" content="${escDesc}">
<meta property="og:image" content="${escImg}">
<meta property="og:url" content="${escCanon}">
<meta name="twitter:card" content="${twCard}">
<meta name="twitter:title" content="${escTitle}">
<meta name="twitter:description" content="${escDesc}">
<meta name="twitter:image" content="${escImg}">
<meta name="twitter:url" content="${escCanon}">
<script type="application/ld+json">
${jsonLd}
</script>
`;
}

function processPage(entry) {
  const full = path.join(WEBSITE_ROOT, entry.rel);
  if (!fs.existsSync(full)) {
    console.warn('skip missing', entry.rel);
    return false;
  }
  let html = fs.readFileSync(full, 'utf8');
  const headRe = /<head([^>]*)>([\s\S]*?)<\/head>/i;
  const hm = html.match(headRe);
  if (!hm) {
    console.warn('skip no head', entry.rel);
    return false;
  }
  const headAttrs = hm[1];
  let inner = hm[2];

  const titleInnerRaw = extractTitleInner(inner);
  let metaDesc = extractMetaDescription(inner);
  if (!metaDesc) {
    console.warn('missing description', entry.rel);
    metaDesc = titleInnerRaw.replace(/<[^>]*>/g, '').trim() || 'VendorSoluce.';
  }

  inner = stripSeoFromHeadInner(inner);
  inner = ensureRobots(inner, entry.robots || 'index, follow');

  const seoBlock = buildSeoBlock({
    canonical: entry.canonical,
    titleInnerRaw,
    metaDesc,
    image: entry.image,
    home: !!entry.home,
    robots: entry.robots,
  });

  const newInner = `${inner.trimEnd()}\n${seoBlock}\n${BUNDLE.trimEnd()}\n`;
  const newHead = `<head${headAttrs}>${newInner}</head>`;
  const newHtml = html.replace(headRe, newHead);
  fs.writeFileSync(full, newHtml, 'utf8');
  console.log('ok', entry.rel);
  return true;
}

for (const p of PAGES) {
  processPage(p);
}
console.log(`Normalized ${PAGES.length} pages.`);
