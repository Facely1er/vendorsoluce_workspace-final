/**
 * Canonical VendorSoluce color tokens — single source of truth for Tailwind.
 * All packages must import `sharedTheme` from `shared/tailwind-config`; do not
 * duplicate hex values in per-package tailwind.config.js files.
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

