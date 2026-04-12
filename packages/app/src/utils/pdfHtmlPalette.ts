import { surfaceColors, vendorsoluceColors } from 'shared/tailwind-colors';

const V = vendorsoluceColors;
const S = surfaceColors;

/** Flat names for PDF/HTML template strings */
export const pdf = {
  navy: V['vendorsoluce-navy'],
  teal: V['vendorsoluce-teal'],
  blue: V['vendorsoluce-blue'],
  riskLow: V['risk-low'],
  riskMedium: V['risk-medium'],
  riskHigh: V['risk-high'],
  riskCritical: V['risk-critical'],
  neutralGray: V['neutral-gray'],
  white: S.white,
  mutedText: S.mutedText,
  bodyText: S.bodyText,
  borderLight: S.borderLight,
  tableHeaderBg: S.tableHeaderBg,
  slate50: S.slate50,
  slate200: S.slate200,
  gray50: S.gray50,
  gray100: S.gray100,
  gray200: S.gray200,
  gray400: S.gray400,
  gray700: S.gray700,
  amber100: S.amber100,
  amber800: S.amber800,
  amber900: S.amber900,
  red50: S.red50,
  blue50: S.blue50,
  sky100: S.sky100,
};

export function pdfScoreColor(score: number): string {
  if (score >= 80) return pdf.riskLow;
  if (score >= 60) return pdf.riskMedium;
  if (score >= 40) return pdf.riskHigh;
  return pdf.riskCritical;
}

export function pdfPriorityColor(priority: string): string {
  switch (priority) {
    case 'critical':
      return pdf.riskCritical;
    case 'high':
      return pdf.riskHigh;
    case 'medium':
      return pdf.riskMedium;
    case 'low':
      return pdf.riskLow;
    default:
      return pdf.neutralGray;
  }
}
