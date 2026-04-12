import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read header and footer files
const headerPath = path.join(__dirname, 'includes', 'header.html');
const footerPath = path.join(__dirname, 'includes', 'footer.html');
const headErmitsPath = path.join(__dirname, 'includes', 'head-ermits-global.html');

const headerHtml = fs.readFileSync(headerPath, 'utf-8').trimEnd();
const footerHtml = fs.readFileSync(footerPath, 'utf-8').trimEnd();
const headErmitsTemplate = fs.readFileSync(headErmitsPath, 'utf-8');

// ─── Canonical theme-script helpers ────────────────────────────────────────
// Marker attributes used to make injection idempotent across repeated builds.
const THEME_FLASH_ATTR = 'data-vs-theme-init';
const THEME_TOGGLE_ATTR = 'data-vs-theme-toggle';

// Tiny inline script placed at the very top of <head> — applies saved theme
// before any stylesheet parses, preventing a flash of unstyled content.
const THEME_FLASH_SCRIPT =
    `<script ${THEME_FLASH_ATTR}>(function(){try{var t=localStorage.getItem('theme');` +
    `var d=window.matchMedia('(prefers-color-scheme: dark)').matches;` +
    `if(t==='dark'||(!t&&d)){document.documentElement.classList.add('dark');}` +
    `else{document.documentElement.classList.remove('dark');}}catch(e){}})();</script>`;

function themeScriptTag(isSubdirectory) {
    const prefix = isSubdirectory ? '../' : '';
    return `<script ${THEME_TOGGLE_ATTR} src="${prefix}assets/js/theme.js"></script>`;
}

/**
 * Remove all inline theme-toggle and flash-prevention scripts, then inject
 * the canonical flash-prevention snippet into <head> and load theme.js after
 * navigation.js.  Uses marker attributes for idempotency.
 */
function normalizeThemeScripts(html, isSubdirectory) {
    // Remove inline script blocks (no src) that contain theme logic.
    html = html.replace(/<script(?![^>]*\bsrc\b)[^>]*>([\s\S]*?)<\/script>/g, (match, body) => {
        // Theme scripts: contain localStorage AND any known theme-toggle identifier.
        if (
            body.includes('localStorage') &&
            (
                body.includes('getTheme') ||
                body.includes('applyTheme') ||
                body.includes('updateThemeIcons') ||
                body.includes('data-theme-toggle')
            )
        ) {
            return '';
        }
        // Tiny flash-prevention scripts contain classList.add('dark') + localStorage.
        // Skip any script already carrying the canonical marker.
        if (
            body.includes("classList.add('dark')") &&
            body.includes('localStorage') &&
            !match.includes(THEME_FLASH_ATTR)
        ) {
            return '';
        }
        return match;
    });

    // Remove HTML comments that label a theme-toggle script block.
    html = html.replace(/<!--[\s\S]*?-->/g, (comment) => {
        if (/\bTheme toggle\b/i.test(comment)) return '';
        return comment;
    });

    // Inject canonical flash-prevention as the first child of <head>.
    if (!html.includes(THEME_FLASH_ATTR)) {
        html = html.replace(/(<head[^>]*>)/i, '$1\n' + THEME_FLASH_SCRIPT);
    }

    // Inject theme.js immediately after navigation.js (once per page).
    if (!html.includes(THEME_TOGGLE_ATTR)) {
        const navTag = navigationScriptTag(isSubdirectory);
        if (html.includes(navTag)) {
            html = html.replace(navTag, navTag + themeScriptTag(isSubdirectory));
        }
    }

    return html;
}
// ───────────────────────────────────────────────────────────────────────────

function escapeHtmlAttr(value) {
    return String(value).replace(/"/g, '&quot;');
}

/** Fix double-encoded entities inside og:title / twitter:title meta tags (e.g. &amp;trade;).
 *  Also repairs corrupted em-dash rendered as "?" (e.g. "How It Works ? VendorSoluce"). */
function repairOgTwitterTitleEntities(html) {
    return html.replace(
        /<meta\s+[^>]*(?:property|name)=["'](?:og:title|twitter:title)["'][^>]*>/gi,
        (tag) => tag
            .replace(/&amp;trade;/g, '&trade;')
            .replace(/&amp;#(\d+);/g, '&#$1;')
            .replace(/\b(\w[\w\s]*)\s*\?\s*(VendorSoluce)/g, '$1 — $2')
    );
}

/** Normalize social-preview image references: replace .svg with .png in OG/Twitter image meta tags.
 *  Two passes handle both attribute orderings:
 *    1. property/name attribute before content attribute
 *    2. content attribute before property/name attribute
 */
function normalizeSocialPreviewImages(html) {
    return html.replace(
        /(<meta\s+[^>]*(?:property|name)=["'](?:og:image|twitter:image)["'][^>]*content=["'][^"']*?)social-preview\.svg(["'][^>]*>)/gi,
        '$1social-preview.png$2'
    ).replace(
        /(<meta\s+[^>]*content=["'][^"']*?)social-preview\.svg(["'][^>]*(?:property|name)=["'](?:og:image|twitter:image)["'][^>]*>)/gi,
        '$1social-preview.png$2'
    );
}

/** Head region: closed </head> or everything from <head> until <body> if </head> is missing. */
function extractHeadLikeSection(html) {
    const closed = html.match(/<head[^>]*>[\s\S]*?<\/head>/i);
    if (closed) {
        return closed[0];
    }
    const unclosed = html.match(/<head[^>]*>[\s\S]*?(?=<body\b)/i);
    return unclosed ? unclosed[0] : '';
}

function insertBeforeClosingHead(html, fragment) {
    const bodyMatch = html.match(/<body\b/i);
    if (!bodyMatch) {
        return html.replace(/<\/head>/i, (m) => fragment + m);
    }
    const bodyIdx = bodyMatch.index;
    const beforeBody = html.slice(0, bodyIdx);
    const headCloseIdx = beforeBody.lastIndexOf('</head>');
    if (headCloseIdx === -1) {
        return html.slice(0, bodyIdx) + fragment + html.slice(bodyIdx);
    }
    return html.slice(0, headCloseIdx) + fragment + html.slice(headCloseIdx);
}

function getResolvedTitleFromHtml(html) {
    const m = html.match(/<title>([^<]*)<\/title>/i);
    return m ? m[1].trim() : '';
}

function getFirstDescriptionContentFromHtml(html) {
    const headLike = extractHeadLikeSection(html);
    if (!headLike) {
        return '';
    }
    let m = headLike.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i);
    if (m) {
        return m[1];
    }
    m = headLike.match(/<meta\s+content=["']([^"']*)["']\s+name=["']description["']/i);
    return m ? m[1] : '';
}

function propertyMetaContentNonEmpty(html, prop) {
    const esc = prop.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re1 = new RegExp(`<meta\\s+property=["']${esc}["']\\s+content=["']([^"']*)["']`, 'i');
    const re2 = new RegExp(`<meta\\s+content=["']([^"']*)["']\\s+property=["']${esc}["']`, 'i');
    let m = html.match(re1);
    if (m) {
        return m[1].trim() !== '';
    }
    m = html.match(re2);
    return m ? m[1].trim() !== '' : false;
}

function twitterTitleContentNonEmpty(html) {
    let m = html.match(/<meta\s+name=["']twitter:title["']\s+content=["']([^"']*)["']/i);
    if (m) {
        return m[1].trim() !== '';
    }
    m = html.match(/<meta\s+content=["']([^"']*)["']\s+name=["']twitter:title["']/i);
    return m ? m[1].trim() !== '' : false;
}

function twitterDescriptionContentNonEmpty(html) {
    let m = html.match(/<meta\s+name=["']twitter:description["']\s+content=["']([^"']*)["']/i);
    if (m) {
        return m[1].trim() !== '';
    }
    m = html.match(/<meta\s+content=["']([^"']*)["']\s+name=["']twitter:description["']/i);
    return m ? m[1].trim() !== '' : false;
}

/**
 * Add Open Graph / Twitter title+description when missing (non-destructive).
 * Does not add og:image, twitter:image, canonical, or og:url.
 */
function ensureMissingOgTwitterMeta(html) {
    if (!/<head[\s>]/i.test(html)) {
        return html;
    }
    const title = getResolvedTitleFromHtml(html);
    const rawDesc = getFirstDescriptionContentFromHtml(html);
    if (!title || rawDesc.trim() === '') {
        return html;
    }

    const escTitle = escapeHtmlAttr(title);
    const escDesc = escapeHtmlAttr(rawDesc);
    let out = html;

    if (!propertyMetaContentNonEmpty(out, 'og:title')) {
        out = out.replace(/<meta\s+property=["']og:title["']\s+content=["']\s*["']\s*\/?>\s*/gi, '');
        out = out.replace(/<meta\s+content=["']\s*["']\s+property=["']og:title["']\s*\/?>\s*/gi, '');

        const ogParts = [];
        if (!propertyMetaContentNonEmpty(out, 'og:type')) {
            ogParts.push('<meta property="og:type" content="website">');
        }
        if (!propertyMetaContentNonEmpty(out, 'og:site_name')) {
            ogParts.push('<meta property="og:site_name" content="ERMITS">');
        }
        ogParts.push(`<meta property="og:title" content="${escTitle}">`);
        if (!propertyMetaContentNonEmpty(out, 'og:description')) {
            ogParts.push(`<meta property="og:description" content="${escDesc}">`);
        }
        out = insertBeforeClosingHead(out, `\n${ogParts.join('\n')}\n`);
    }

    if (!twitterTitleContentNonEmpty(out)) {
        out = out.replace(/<meta\s+name=["']twitter:title["']\s+content=["']\s*["']\s*\/?>\s*/gi, '');
        out = out.replace(/<meta\s+content=["']\s*["']\s+name=["']twitter:title["']\s*\/?>\s*/gi, '');

        const twParts = [`<meta name="twitter:title" content="${escTitle}">`];
        if (!twitterDescriptionContentNonEmpty(out)) {
            twParts.push(`<meta name="twitter:description" content="${escDesc}">`);
        }
        out = insertBeforeClosingHead(out, `\n${twParts.join('\n')}\n`);
    }

    return out;
}

/** Use summary_large_image when og:image or twitter:image exists; otherwise summary. */
function normalizeTwitterCardForImagePresence(html) {
    const headLike = extractHeadLikeSection(html);
    if (!headLike) {
        return html;
    }
    const hasImage = /(?:property|name)=["'](?:og:image|twitter:image)["']/i.test(headLike);
    const card = hasImage ? 'summary_large_image' : 'summary';
    const hasCard =
        /name=["']twitter:card["']/i.test(html) || /property=["']twitter:card["']/i.test(html);
    if (!hasCard) {
        return insertBeforeClosingHead(html, `\n<meta name="twitter:card" content="${card}">\n`);
    }
    let out = html.replace(
        /<meta\s+name=["']twitter:card["']\s+content=["'][^"']*["']\s*\/?>/gi,
        `<meta name="twitter:card" content="${card}">`
    );
    out = out.replace(
        /<meta\s+property=["']twitter:card["']\s+content=["'][^"']*["']\s*\/?>/gi,
        `<meta property="twitter:card" content="${card}">`
    );
    return out;
}

/**
 * Merge ERMITS SEO bundle and normalize title / Open Graph / Twitter meta in <head> only.
 * When meta name="ermits-seo-bundle" is already present, skips bundle inject and title rewrites
 * but still runs ensureMissingOgTwitterMeta and twitter:card normalization.
 */
/** If the ERMITS bundle was inserted after </head> (invalid), move it before </head>. */
function fixErmitsBundlePlacedAfterHeadClose(html) {
    return html.replace(
        /<\/head>(\s*)(<!-- ERMITS global SEO bundle:[\s\S]*?<\/script>)(\s*)(?=<body\b)/i,
        (match, sp1, bundle, sp2) => bundle + sp1 + '</head>' + sp2
    );
}

function injectHeadBundleBlock(html, bundleBlock) {
    const bodyMatch = html.match(/<body\b/i);
    if (!bodyMatch) {
        return html.replace(/<\/head>/i, (m) => bundleBlock + m);
    }
    const bodyIdx = bodyMatch.index;
    const beforeBody = html.slice(0, bodyIdx);
    const headCloseIdx = beforeBody.lastIndexOf('</head>');
    if (headCloseIdx !== -1) {
        return html.slice(0, headCloseIdx) + bundleBlock + html.slice(headCloseIdx);
    }
    return html.slice(0, bodyIdx) + '</head>' + bundleBlock + html.slice(bodyIdx);
}

function mergeVendorSoluceErmitsHead(html) {
    let out = normalizeSocialPreviewImages(repairOgTwitterTitleEntities(fixErmitsBundlePlacedAfterHeadClose(html)));
    if (!/<head[\s>]/i.test(out)) {
        return out;
    }

    const hasBundle = /name=["']ermits-seo-bundle["']/i.test(out);

    if (!hasBundle) {
    // Drop legacy author tags so a single ERMITS author remains after the bundle is injected
    out = out.replace(/<meta\s+name=["']author["'][^>]*>\s*/gi, '');

    out = out.replace(/<title>([^<]*)<\/title>/i, (full, inner) => {
        const t = inner.trim();
        if (/ERMITS/i.test(t)) {
            return full;
        }
        return `<title>${t} | ERMITS</title>`;
    });

    const titleMatch = out.match(/<title>([^<]*)<\/title>/i);
    const resolvedTitle = titleMatch ? titleMatch[1].trim() : '';
    const escapedTitle = resolvedTitle ? escapeHtmlAttr(resolvedTitle) : '';

    if (escapedTitle) {
        out = out.replace(
            /<meta\s+property=["']og:title["']\s+content=["'][^"']*["']\s*\/?>/gi,
            `<meta property="og:title" content="${escapedTitle}">`
        );
        out = out.replace(
            /<meta\s+content=["'][^"']*["']\s+property=["']og:title["']\s*\/?>/gi,
            `<meta content="${escapedTitle}" property="og:title">`
        );
        out = out.replace(
            /<meta\s+name=["']twitter:title["']\s+content=["'][^"']*["']\s*\/?>/gi,
            `<meta name="twitter:title" content="${escapedTitle}">`
        );
        out = out.replace(
            /<meta\s+content=["'][^"']*["']\s+name=["']twitter:title["']\s*\/?>/gi,
            `<meta content="${escapedTitle}" name="twitter:title">`
        );
        out = out.replace(
            /<meta\s+property=["']twitter:title["']\s+content=["'][^"']*["']\s*\/?>/gi,
            `<meta property="twitter:title" content="${escapedTitle}">`
        );
        out = out.replace(
            /<meta\s+content=["'][^"']*["']\s+property=["']twitter:title["']\s*\/?>/gi,
            `<meta content="${escapedTitle}" property="twitter:title">`
        );
    }

    out = out.replace(
        /<meta\s+property=["']og:site_name["']\s+content=["'][^"']*["']\s*\/?>/gi,
        '<meta property="og:site_name" content="ERMITS">'
    );
    out = out.replace(
        /<meta\s+content=["'][^"']*["']\s+property=["']og:site_name["']\s*\/?>/gi,
        '<meta content="ERMITS" property="og:site_name">'
    );

    if (!/name=["']robots["']/i.test(out)) {
        const robotsTag = '<meta name="robots" content="index, follow">\n';
        if (/<meta\s+charset[^>]*>/i.test(out)) {
            out = out.replace(/(<meta\s+charset[^>]*>\s*)/i, '$1' + robotsTag);
        } else if (/<meta\s+name=["']viewport["'][^>]*>/i.test(out)) {
            out = out.replace(/(<meta\s+name=["']viewport["'][^>]*>\s*)/i, '$1' + robotsTag);
        } else {
            out = out.replace(/<head[^>]*>/i, (h) => h + '\n' + robotsTag);
        }
    }

    const bundle = headErmitsTemplate;
    const bundleBlock = '\n' + bundle + '\n';
    out = injectHeadBundleBlock(out, bundleBlock);
    }

    out = ensureMissingOgTwitterMeta(out);
    return normalizeTwitterCardForImagePresence(out);
}

// Single source of truth: mobile menu and active nav live in assets/js/navigation.js
function navigationScriptTag(isSubdirectory) {
  const prefix = isSubdirectory ? '../' : '';
  return `<script src="${prefix}assets/js/navigation.js"></script>`;
}

// Function to adjust paths for subdirectories
function adjustPathsForSubdirectory(html, isSubdirectory) {
    if (!isSubdirectory) {
        return html;
    }
    
    // Adjust relative paths - add ../ prefix (legal/ is one level deep)
    return html
        .replace(/href="([^"]*\.html)"/g, (match, href) => {
            if (href.startsWith('http') || href.startsWith('/') || href.startsWith('../')) {
                return match;
            }
            return `href="../${href}"`;
        })
        .replace(/src="\.\/([^"]*)"/g, 'src="../$1"');
}

/** Start-of-embedded-header markers (prefix match — 404 uses HTML entity in comment). */
const EMBEDDED_HEADER_MARKERS = [
    '<!-- Shared Header Navigation for VendorSoluce',
    '<!-- CANONICAL HEADER TEMPLATE',
    '<!-- CANONICAL HEADER \u2014',
    '<!-- Canonical header',
    '<!-- Canonical site header',
    '<!-- Header/nav outside #root',
];

function findEmbeddedHeaderStart(src) {
    let headerStart = -1;
    for (const m of EMBEDDED_HEADER_MARKERS) {
        const i = src.indexOf(m);
        if (i !== -1 && (headerStart === -1 || i < headerStart)) {
            headerStart = i;
        }
    }
    return headerStart;
}

/**
 * Replace inline header block (from first marker through mobile drawer) with canonical includes/header.html.
 */
function replaceEmbeddedHeaderBlock(src, isSubdirectory) {
    const headerStart = findEmbeddedHeaderStart(src);
    if (headerStart === -1) {
        return src;
    }
    const mainStart = src.indexOf('<main', headerStart);
    const bodyEnd = src.indexOf('</body>', headerStart);
    let endPos = mainStart !== -1 && (bodyEnd === -1 || mainStart < bodyEnd) ? mainStart : bodyEnd;

    if (endPos !== -1 && endPos > headerStart) {
        let searchStart = endPos - 1;
        let divCount = 0;
        let foundEnd = false;
        for (let i = searchStart; i >= headerStart; i--) {
            if (src.substring(i, i + 6) === '</div>') {
                divCount++;
                if (divCount >= 3) {
                    const beforeDiv = src.substring(Math.max(0, i - 50), i);
                    if (beforeDiv.includes('Mobile Menu Panel') || beforeDiv.includes('data-mobile-menu')) {
                        endPos = i + 6;
                        foundEnd = true;
                        break;
                    }
                }
            }
        }
        if (!foundEnd && mainStart !== -1) {
            endPos = mainStart;
        }
    }

    if (headerStart === -1 || endPos === -1 || endPos <= headerStart) {
        return src;
    }
    let adjustedHeader = headerHtml;
    if (isSubdirectory) {
        adjustedHeader = adjustPathsForSubdirectory(headerHtml, true);
    }
    adjustedHeader = adjustedHeader + navigationScriptTag(isSubdirectory);
    return src.substring(0, headerStart) + adjustedHeader + src.substring(endPos);
}

// Function to process a single HTML file
function processFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const isSubdirectory =
        filePath.includes(path.sep + 'legal' + path.sep) ||
        filePath.includes(path.sep + 'radar' + path.sep) ||
        filePath.includes(path.sep + 'assessment' + path.sep);
    
    let updatedContent = mergeVendorSoluceErmitsHead(content);
    
    // Replace header placeholder or update existing header
    if (content.includes('<div id="shared-header"></div>')) {
        let adjustedHeader = headerHtml;
        if (isSubdirectory) {
            adjustedHeader = adjustPathsForSubdirectory(headerHtml, true);
        }
        // Add navigation.js (mobile menu + active nav) after the header
        adjustedHeader = adjustedHeader + navigationScriptTag(isSubdirectory);
        updatedContent = updatedContent.replace(
            '<div id="shared-header"></div>',
            adjustedHeader
        );
    } else {
        updatedContent = replaceEmbeddedHeaderBlock(updatedContent, isSubdirectory);
    }
    
    // Canonical logo: fixed size via .vs-brand-logo in tailwind.css + width/height; same as includes/header.html
    const canonicalLogoClass = 'vs-brand-logo h-[3.75rem] w-[3.75rem] max-h-[3.75rem] max-w-[3.75rem] flex-shrink-0 transition-transform group-hover:scale-105 object-contain';
    updatedContent = updatedContent.replace(
        /class="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 flex-shrink-0 transition-transform group-hover:scale-105"/g,
        `class="${canonicalLogoClass}"`
    );
    updatedContent = updatedContent.replace(
        /class="h-9 w-9 sm:h-10 sm:w-10 md:h-11 md:w-11 flex-shrink-0 transition-transform group-hover:scale-105"/g,
        `class="${canonicalLogoClass}"`
    );
    updatedContent = updatedContent.replace(
        /class="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 flex-shrink-0 transition-transform group-hover:scale-105"/g,
        `class="${canonicalLogoClass}"`
    );
    updatedContent = updatedContent.replace(
        /class="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 transition-transform group-hover:scale-105"/g,
        `class="${canonicalLogoClass}"`
    );

    // Remove hardcoded active state from Home link - let JavaScript handle it dynamically
    // Replace Home link that has active styling with default styling
    // Match Home link with active classes (class attribute comes first in the HTML)
    updatedContent = updatedContent.replace(
        /<a\s+class="[^"]*text-vendorsoluce-green[^"]*bg-vendorsoluce-green\/20[^"]*border[^"]*border-vendorsoluce-green\/30[^"]*"\s+title="Home"\s+href="[^"]*index\.html">/g,
        '<a class="px-2.5 py-1.5 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-vendorsoluce-green dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 flex items-center" title="Home" href="index.html">'
    );
    
    // Fix missing transition-colors on navigation links
    // Match navigation links that have hover classes but no transition-colors
    // Simple replacement: add transition-colors before "flex items-center" if not present
    // This must run AFTER header replacement to fix any missing transitions
    // Match the exact pattern: hover:bg-gray-50 dark:hover:bg-gray-700 followed by flex items-center"
    updatedContent = updatedContent.replace(
        /hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center"/g,
        'hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 flex items-center"'
    );
    
    if (content.includes('data-mobile-menu-button') && !content.includes('navigation.js')) {
        // Header is already embedded but navigation script is missing
        const mobileMenuPattern = /(<\/div>\s*<\/div>\s*<\/nav>)/;
        if (mobileMenuPattern.test(updatedContent)) {
            updatedContent = updatedContent.replace(mobileMenuPattern, '$1' + navigationScriptTag(isSubdirectory));
        }
    }
    
    // Replace footer placeholder or update existing footer
    if (content.includes('<div id="shared-footer"></div>')) {
        let adjustedFooter = footerHtml;
        if (isSubdirectory) {
            adjustedFooter = adjustPathsForSubdirectory(footerHtml, true);
        }
        updatedContent = updatedContent.replace(
            '<div id="shared-footer"></div>',
            adjustedFooter
        );
    } else if (content.includes('<footer')) {
        // Footer is already embedded - replace the entire footer section to update branding (use updatedContent so header changes are preserved)
        // Also capture any preceding canonical footer comment lines so they don't accumulate on repeated runs
        const footerPattern = /((?:<!--\s*CANONICAL FOOTER[^>]*>\s*)*)<footer[^>]*>[\s\S]*?<\/footer>/;
        if (footerPattern.test(updatedContent)) {
            let adjustedFooter = footerHtml;
            if (isSubdirectory) {
                adjustedFooter = adjustPathsForSubdirectory(footerHtml, true);
            }
            updatedContent = updatedContent.replace(footerPattern, adjustedFooter);
        }
    }
    
    // Remove the load-shared.js script since we're embedding directly
    updatedContent = updatedContent.replace(
        /<script src="[^"]*includes\/load-shared\.js"[^>]*><\/script>\s*/gi,
        ''
    );
    updatedContent = updatedContent.replace(
        /<script src="\.\.\/includes\/load-shared\.js"[^>]*><\/script>\s*/gi,
        ''
    );
    
    // Normalize layout: match home page padding (px-6 sm:px-8 lg:px-12) for breadcrumb and main content
    // Header uses px-2 sm:px-4 lg:px-8 so it won't be affected
    updatedContent = updatedContent.replace(/\bpx-4 sm:px-6 lg:px-8\b/g, 'px-6 sm:px-8 lg:px-12');
    updatedContent = updatedContent.replace(/\bmax-w-7xl mx-auto px-4 py-3\b/g, 'max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-3');

    // Remove page-specific footer grid overrides so all pages use .vs-footer-grid from tailwind.css
    updatedContent = updatedContent.replace(
        /\s*\/\* Footer horizontal layout \(match home page\): row of columns on md\+ \*\/\s*footer \.max-w-7xl > \.grid \{[^}]*\}\s*@media \(min-width: 768px\) \{\s*footer \.max-w-7xl > \.grid \{[^}]*\}\s*\}\s*/g,
        ''
    );

    // Ensure pages with centralized platform/portal links load portal-config and portal-links
    const hasPortalLinks = /data-(platform-path|vendor-portal-path|portal-path)=/.test(updatedContent);
    const hasPortalScripts = /portal-config\.js|portal-links\.js/.test(updatedContent);
    if (hasPortalLinks && !hasPortalScripts) {
        const scriptPrefix = isSubdirectory ? '../' : '';
        const portalScripts = `  <script src="${scriptPrefix}assets/js/portal-config.js"></script>\n  <script src="${scriptPrefix}assets/js/portal-links.js"></script>\n  `;
        updatedContent = updatedContent.replace(/(\s*)<\/body>/i, portalScripts + '$1</body>');
    }

    // Normalize theme scripts: remove scattered inline implementations and
    // replace with the canonical flash-prevention + theme.js pair.
    updatedContent = normalizeThemeScripts(updatedContent, isSubdirectory);

    // Only write if content changed
    if (updatedContent !== content) {
        fs.writeFileSync(filePath, updatedContent, 'utf-8');
        console.log(`✓ Updated: ${path.relative(__dirname, filePath)}`);
        return true;
    }
    
    return false;
}

// Find all HTML files
function findHtmlFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory() && file !== 'node_modules' && file !== '.git' && file !== 'includes' && file !== 'homepage_files') {
            findHtmlFiles(filePath, fileList);
        } else if (file.endsWith('.html')) {
            fileList.push(filePath);
        }
    });
    
    return fileList;
}

// Copy logo from app/public to website/homepage_files so website always uses same logo as app
const appLogo = path.join(__dirname, '..', 'app', 'public', 'vendorsoluce.png');
const websiteLogoDir = path.join(__dirname, 'homepage_files');
const websiteLogo = path.join(websiteLogoDir, 'vendorsoluce.png');
if (fs.existsSync(appLogo)) {
  if (!fs.existsSync(websiteLogoDir)) fs.mkdirSync(websiteLogoDir, { recursive: true });
  fs.copyFileSync(appLogo, websiteLogo);
  console.log('Synced logo from app/public to website/homepage_files/vendorsoluce.png');
}

// Main execution
console.log('Embedding header and footer into HTML files...\n');

const htmlFiles = findHtmlFiles(__dirname);
let updatedCount = 0;

htmlFiles.forEach(file => {
    if (processFile(file)) {
        updatedCount++;
    }
});

console.log(`\n✓ Processed ${htmlFiles.length} files, updated ${updatedCount} files.`);

