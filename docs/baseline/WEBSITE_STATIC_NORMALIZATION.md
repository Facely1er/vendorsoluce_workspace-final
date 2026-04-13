# VendorSoluce static website — normalization reference

**Package:** `packages/website` (`vendorsoluce-static`)  
**Purpose:** Document how the marketing/static site stays aligned with `packages/shared/routes.json`, shared Tailwind tokens, and the verification pipeline. Use this when editing HTML, radar assets, or chrome.

---

## 1. Route alignment (`MR` vs `.html` URLs)

| Mechanism | Role |
|-----------|------|
| `packages/shared/routes.json` | Single source of truth for **marketing** paths (`MR.*`) used by the React app and tooling. |
| `packages/website/scripts/generate-route-manifest.mjs` | Emits `assets/js/generated/route-manifest.js` by **reading the same `routes.json`**. Footer/platform verification consumes this manifest. |
| Static pages | Internal links use **file URLs** (`/index.html`, `/pricing.html`, …) as deployed on static hosts. SPA-style paths from `MR` (e.g. `/pricing`) apply to the **platform** app, not necessarily to raw static file servers unless rewrites are configured. |

**Rule:** Add or rename marketing routes in **`routes.json` only**, regenerate the manifest (`npm run verify:routes` or full `npm run build`), then update any static HTML hrefs if the public URL strategy changes.

---

## 2. Tokens and CSS

- **Tailwind:** `packages/website/tailwind.config.js` extends **`sharedTheme`** from `shared/tailwind-config` (same as app/portal).
- **Compiled CSS:** `npm run build:css` writes `assets/css/tailwind.css` from `src/tailwind.css`.
- **Design tokens:** Shared `tokens.css` contract is enforced by `verify-website-tokens-css.mjs` and `verify-website-html-loads-tokens.mjs` (see `packages/shared/scripts/`).

Do not introduce raw hex in HTML/JS under scanned paths; use Tailwind semantic classes (`text-vendorsoluce-green`, risk colors, etc.).

---

## 3. Header, footer, and layout padding

Canonical chrome lives in:

- `includes/header.html`
- `includes/footer.html`
- `includes/head-ermits-global.html`

**Build step:** `embed-header-footer.js` (run as part of `npm run build`) injects these into each page and normalizes theme scripts.

**Padding convention (intentional vs app checklist):**

- **Nav row** uses `max-w-7xl mx-auto px-2 sm:px-4 lg:px-8` — slightly tighter horizontal padding than `docs/DESIGN-SYSTEM-CHECKLIST.md`’s generic `px-4 sm:px-6 lg:px-8` so the fixed glass nav stays compact on small screens.
- **Footer** uses `px-6 sm:px-8 lg:px-12` on the inner container.
- **Embed script** also rewrites main-content occurrences of `px-4 sm:px-6 lg:px-8` → `px-6 sm:px-8 lg:px-12` for consistency with the home layout. Header keeps **`px-2 sm:px-4 lg:px-8`** so it is not swept by that replacement.

If you change padding, update **`includes/*.html`** first, then run **`npm run build`** so all pages receive the same chrome.

---

## 4. Verification commands

Run from **`packages/website`**:

| Command | What it checks |
|---------|----------------|
| `npm run verify:ui` | Shared token imports, no forbidden inline colors in scanned sources, radar/website token contracts, HTML loads tokens CSS. |
| `npm run verify` | Full suite: UI + radar + report template + internal links + platform links + chrome + SEO + route manifest generation. |

From **monorepo root**:

```bash
npm run verify:website
```

(Runs `npm run verify -w vendorsoluce-static`.)

**Before merging** changes that touch HTML, CSS, or radar: `npm run verify` in `packages/website`.

---

## 5. Normalization checklist (website)

- [x] Route manifest generated from `packages/shared/routes.json`.
- [x] Tailwind uses `shared/tailwind-config`; `verify:ui` passes.
- [x] Canonical header/footer in `includes/`; build embeds them.
- [x] Platform/footer links validated against manifest (`verify:platform-links`).
- [x] Full `verify` passes (confirmed in baseline pass).

**Ongoing:** After editing includes or token CSS, run **`npm run build`** (or at least `embed-header-footer.js` + `build:css` as in `package.json` `build` script) and **`npm run verify`**.

---

## 6. Related docs

- [VENDORSOLUCE_NORMALIZATION_REFERENCE.md](./VENDORSOLUCE_NORMALIZATION_REFERENCE.md) — monorepo-wide normalization.
- [../DESIGN-SYSTEM-CHECKLIST.md](../DESIGN-SYSTEM-CHECKLIST.md) — brand colors and layout; static site nav padding per §3 above.
- [WORKSPACE_COMPLETION_NOTES_2026-04-12.md](../../WORKSPACE_COMPLETION_NOTES_2026-04-12.md) — recent workspace/static verification context.

---

**Last updated:** April 2026
