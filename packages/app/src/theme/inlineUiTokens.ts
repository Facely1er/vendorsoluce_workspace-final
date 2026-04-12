/**
 * Inline UI tokens for libraries that require hex (Recharts, react-joyride, injected CSS).
 * Import from here — do not scatter new hex literals in components.
 * Canonical palette: packages/shared/tailwind-colors.js
 */
import { surfaceColors, vendorsoluceColors } from 'shared/tailwind-colors';

export const rechartsDefault = surfaceColors.chartDefault;

export const chartStrokes = {
  red: '#ef4444',
  green: '#10b981',
  defaultStroke: surfaceColors.chartDefault,
} as const;

export const piePalette = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  surfaceColors.chartDefault,
  '#82CA9D',
] as const;

export const lineBarAreaDefault = rechartsDefault;

/** Pie / dashboard segments (Recharts) — distinct from PDF risk tokens */
export const riskPieSegmentColors = {
  low: '#10B981',
  medium: '#F59E0B',
  high: '#EF4444',
} as const;

export const useChartDataPalette = [...piePalette];

export const useChartDataLines = {
  risk: chartStrokes.red,
  required: chartStrokes.green,
} as const;

/** Vendor inherent risk report — semantic bands */
export function vendorInherentRiskBands(score: number) {
  if (score >= 90) return { bg: '#FEE2E2', text: '#991B1B', bar: '#DC2626' };
  if (score >= 70) return { bg: '#FEF3C7', text: '#92400E', bar: '#F59E0B' };
  if (score >= 40) return { bg: '#FFF7ED', text: '#7C2D12', bar: '#F97316' };
  return { bg: '#F0FDF4', text: '#14532D', bar: '#22C55E' };
}

export const vendorInherentRiskIconCss = [
  `.vir-icon-0{color:${vendorsoluceColors['neutral-gray']}}`,
  `.vir-icon-1{color:${vendorsoluceColors['risk-critical']}}`,
  `.vir-icon-2{color:${vendorsoluceColors['risk-medium']}}`,
  `.vir-icon-3{color:#7C3AED}`,
  `.vir-icon-4{color:#059669}`,
].join('\n');

export const appTour = {
  primaryColor: vendorsoluceColors['vendorsoluce-green'],
  backgroundColor: surfaceColors.white,
  textColor: surfaceColors.bodyText,
  buttonBg: vendorsoluceColors['vendorsoluce-green'],
  buttonBack: surfaceColors.mutedText,
  buttonSkip: '#999999',
} as const;

/** Marketing & transactional HTML emails */
export const emailMarketing = {
  bodyText: surfaceColors.bodyText,
  muted: vendorsoluceColors['neutral-gray'],
  border: surfaceColors.gray200,
  panel: surfaceColors.gray50,
  codeBg: surfaceColors.gray100,
  proseSecondary: '#4b5563',
  emerald500: chartStrokes.green,
  emerald600: '#059669',
  blue500: vendorsoluceColors['vendorsoluce-blue'],
  blue600: '#2563eb',
  violet500: '#8b5cf6',
  violet600: '#7c3aed',
  amber500: vendorsoluceColors['risk-medium'],
  amber600: '#d97706',
  white: surfaceColors.white,
} as const;

export const emailGradients = {
  emerald: `linear-gradient(135deg, ${emailMarketing.emerald500} 0%, ${emailMarketing.emerald600} 100%)`,
  blue: `linear-gradient(135deg, ${emailMarketing.blue500} 0%, ${emailMarketing.blue600} 100%)`,
  violet: `linear-gradient(135deg, ${emailMarketing.violet500} 0%, ${emailMarketing.violet600} 100%)`,
  amber: `linear-gradient(135deg, ${emailMarketing.amber500} 0%, ${emailMarketing.amber600} 100%)`,
} as const;
