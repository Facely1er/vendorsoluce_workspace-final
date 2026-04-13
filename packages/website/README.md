# VendorSoluce Website

Static marketing site (`vendorsoluce-static`): HTML pages, radar tools, Tailwind build, and embed pipeline for shared header/footer.

## Commands

| Command | Description |
|---------|-------------|
| `npm run build` | `verify:ui` → route manifest → embed header/footer → compile Tailwind to `assets/css/tailwind.css` |
| `npm run watch:css` | Rebuild Tailwind CSS on change (local dev) |
| `npm run verify` | Full static checks (UI tokens, radar, links, platform links, chrome, SEO, route manifest) |
| `npm run verify:ui` | Token + inline color + radar design + website token CSS + HTML token links |
| `npm run serve` | Static server on port 8080 |

From monorepo root: **`npm run verify:website`** runs this package’s full `verify`.

## Editing chrome

1. Change **`includes/header.html`** and/or **`includes/footer.html`** (canonical sources).
2. Run **`npm run build`** so `embed-header-footer.js` propagates into all HTML files and syncs logo from `packages/app/public` when present.

## Route manifest

`scripts/generate-route-manifest.mjs` reads **`packages/shared/routes.json`** and writes **`assets/js/generated/route-manifest.js`**. Platform link verification depends on it — keep marketing paths defined in `routes.json`, not only in HTML.

## Documentation

See **`docs/baseline/WEBSITE_STATIC_NORMALIZATION.md`** for padding conventions, token rules, and the checklist vs the React app.

## Notes

Historical planning markdown was archived under `docs/archive/root-notes/` to keep this package root deployable.
