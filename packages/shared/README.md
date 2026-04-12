# Shared Package

Shared configurations and utilities used across VendorSoluce packages.

## Exports

### `tailwind-colors`
Shared color tokens for consistent branding across packages.

### `tailwind-config`
Shared Tailwind theme configuration (`sharedTheme`). App, website, and vendor-risk-portal **must** import this in `tailwind.config.js` — do not duplicate hex colors locally. CI runs `npm run verify:ui` (from repo root), which also checks app/portal sources for stray hex and arbitrary Tailwind color classes; HTML-email colors live in `packages/app/src/theme/inlineUiTokens.ts` (`emailMarketing` / `emailGradients`).

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

