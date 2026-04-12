/**
 * Canonical VendorSoluce color tokens — single source of truth for Tailwind.
 * All packages must import `sharedTheme` from `shared/tailwind-config`; do not
 * duplicate hex values in per-package tailwind.config.js files.
 *
 * Static radar (`packages/website/radar/*.html`) and marketing Tailwind input
 * (`packages/website/src/tailwind.css`) :root mirrors `vendorsoluceColors`; update
 * all when changing brand greens (see `verify-static-radar-design.mjs`).
 */
export const vendorsoluceColors = {
  'vendorsoluce-green': '#33691E',
  'vendorsoluce-light-green': '#66BB6A',
  'vendorsoluce-pale-green': '#E8F5E9',
  'vendorsoluce-dark-green': '#2E5A1A',
  /** Legacy alias used by static HTML class names — same chroma as vendorsoluce-green */
  'secure-green': '#33691E',
  'vendorsoluce-navy': '#1E3B8A',
  'vendorsoluce-teal': '#2D7D7D',
  'vendorsoluce-blue': '#3B82F6',
  'neutral-gray': '#6B7280',
  'risk-critical': '#DC2626',
  'risk-high': '#EA580C',
  'risk-medium': '#F59E0B',
  'risk-low': '#16A34A',
};

/**
 * Surfaces, neutrals, and PDF/HTML-only tokens. Keep in sync with app usage;
 * runtime UI should prefer Tailwind classes wired to vendorsoluceColors where possible.
 */
export const surfaceColors = {
  white: '#ffffff',
  /** Muted secondary text (legacy PDF) */
  mutedText: '#666666',
  bodyText: '#333333',
  borderLight: '#dddddd',
  tableHeaderBg: '#f9f9f9',
  slate50: '#f8fafc',
  slate200: '#e2e8f0',
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray400: '#9CA3AF',
  gray700: '#374151',
  amber100: '#fef3c7',
  amber800: '#92400E',
  amber900: '#78350F',
  red50: '#fef2f2',
  blue50: '#f0f7ff',
  sky100: '#e0f2fe',
  /** Recharts default bar color */
  chartDefault: '#8884d8',
};

/**
 * Expected semantic variables in `packages/website/assets/css/tokens.css`
 * (verified by `scripts/verify-website-tokens-css.mjs`).
 */
export const websiteTokensCssContract = {
  ':root': {
    '--bg': '#ffffff',
    '--bg-2': '#f9fafb',
    '--card': '#ffffff',
    '--border': '#e5e7eb',
    '--text': '#111827',
    '--muted': '#6b7280',
    '--accent': '#33691e',
    '--accent-2': '#66bb6a',
    '--accent-ink': '#ffffff',
    '--accent-rgb': '51 105 30',
    '--accent-2-rgb': '102 187 106',
    '--vendorsoluce-dark-green': '#2e5a1a',
    '--vendorsoluce-pale-green': '#e8f5e9',
    '--risk-critical': '#dc2626',
    '--risk-high': '#ea580c',
    '--risk-medium': '#f59e0b',
    '--risk-low': '#16a34a',
  },
  '.dark': {
    '--bg': '#111827',
    '--bg-2': '#1f2937',
    '--card': '#1f2937',
    '--border': '#374151',
    '--text': '#f9fafb',
    '--muted': '#9ca3af',
    '--accent': '#66bb6a',
    '--accent-2': '#81c784',
    '--accent-ink': '#111827',
    '--accent-rgb': '102 187 106',
    '--accent-2-rgb': '129 199 132',
    '--vendorsoluce-dark-green': '#2e5a1a',
    '--vendorsoluce-pale-green': 'rgba(102, 187, 106, 0.12)',
    '--risk-critical': '#dc2626',
    '--risk-high': '#ea580c',
    '--risk-medium': '#f59e0b',
    '--risk-low': '#16a34a',
  },
};

