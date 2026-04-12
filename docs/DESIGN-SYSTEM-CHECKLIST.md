# VendorSoluce Design System — Consistency Checklist

Use this checklist so the **website**, **platform (app)**, and **portal** stay visually and structurally aligned.

## Brand Colors (single source)

- **Primary green:** `#33691E` (vendorsoluce-green)
- **Light green:** `#66BB6A` (vendorsoluce-light-green)
- **Dark green:** `#2A5618` or `#2E5A1A` (vendorsoluce-dark-green)
- **Pale green (surfaces):** `#E8F5E8` (vendorsoluce-pale-green)
- **Risk:** critical `#DC2626`, high `#EA580C`, medium `#F59E0B`, low `#16A34A`

Prefer `packages/shared/tailwind-colors.js` and Tailwind classes (e.g. `bg-vendorsoluce-green`, `text-vendorsoluce-green`) so all packages use the same values.

## Do not use

- **Blue accent** (`#0072C6` / `#00A3FF`) for primary actions or brand — reserve for non-brand UI only if needed.
- **Separate token sets** for “marketing” vs “app” (e.g. avoid a second `tokens.css` with different `--accent`/`--bg`).

## Layout

- **Max width:** `max-w-7xl mx-auto`
- **Horizontal padding:** `px-4 sm:px-6 lg:px-8`
- **Shell:** `min-h-screen flex flex-col`; main content `flex-1`.

## Shell components

- **Platform:** `Navbar` + `Footer` (app)
- **Portal:** `PortalNav` + `PortalFooter` (portal routes)
- **Website (static):** Same header/footer includes across all HTML pages; same spacing and nav pattern.

## Theming

- **Light/dark:** Use `ThemeProvider` and Tailwind `dark:` classes; avoid hardcoded light-only or dark-only pages.
- **Tokens:** Prefer CSS variables that exist in both `:root` and `.dark` (e.g. app’s `index.css`), or Tailwind theme that respects `darkMode: 'class'`.

## New pages / packages

1. Use the same Tailwind theme (vendorsoluce-* and risk-* colors).
2. Use shared layout (same max-width, padding, header/footer pattern).
3. Do not introduce new token files (e.g. `--accent`, `--bg`) unless they alias the existing VendorSoluce tokens.
4. Prefer Tailwind + shared tokens over new component-level CSS files.

## Quick reference

- App styles: `packages/app/src/index.css`
- Shared colors: `packages/shared/tailwind-colors.js`
- Full audit: `docs/PRODUCTION-READINESS-AND-DESIGN-AUDIT.md`
