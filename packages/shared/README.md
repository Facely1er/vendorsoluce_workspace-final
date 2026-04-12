# Shared Package

Shared configurations and utilities used across VendorSoluce packages.

## Exports

### `tailwind-colors`
Shared color tokens for consistent branding across packages. This file is the **only** source for brand hex values (`vendorsoluceColors`, `surfaceColors`).

### `tailwind-config`
Shared Tailwind theme configuration (`sharedTheme`). App, website, and vendor-risk-portal **must** import this in `tailwind.config.js` — do not duplicate hex colors locally.

### UI design enforcement (`npm run verify:ui` from repo root)

| Script | What it enforces |
|--------|-------------------|
| `verify-ui-tokens.mjs` | App, website, portal `tailwind.config.js` import `shared/tailwind-config` and contain **no** hex literals. |
| `verify-ui-inline.mjs` | `packages/app/src` and `packages/vendor-risk-portal/src` contain **no** raw hex and no Tailwind arbitrary color classes `[...#...]` (allowlisted sinks: `tailwind-colors.js`, `inlineUiTokens.ts`, `pdfHtmlPalette.ts`, `TemplatePreviewPage.tsx`). |
| `verify-static-radar-design.mjs` | Radar HTML/CSS under `packages/website/radar/` plus `packages/website/src/tailwind.css` use `:root` brand variables that **match** `vendorsoluceColors` where declared; checked assets must not reintroduce legacy Material palette hex values. |

HTML email and Joyride tokens that need hex live in `packages/app/src/theme/inlineUiTokens.ts` (`emailMarketing` / `emailGradients`, `appTour`).

## Usage

```javascript
// In tailwind.config.js
import { sharedTheme } from 'shared/tailwind-config';

export default {
  theme: {
    ...sharedTheme,
    // Add package-specific extensions
  }
}
```

