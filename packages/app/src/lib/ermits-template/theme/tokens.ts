/**
 * Design tokens: common baseline for all derived products.
 * Projects (CyberCaution, VendorSoluce, CyberCorrect) use the same token names for consistent styling;
 * override only what is needed for brand/focus (e.g. primary, accent).
 * Values are HSL triplets as in Tailwind/CSS (e.g. "221 83% 53%" for primary).
 */

export interface ThemeTokens {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  accent: string;
  accentForeground: string;
  muted: string;
  mutedForeground: string;
  destructive: string;
  destructiveForeground: string;
  success: string;
  successForeground: string;
  warning: string;
  warningForeground: string;
  border: string;
  input: string;
  ring: string;
  radius: string;
}

/** Light theme baseline — single source of truth for token names and default values. */
export const THEME_BASELINE_LIGHT: ThemeTokens = {
  background: '0 0% 100%',
  foreground: '222.2 84% 4.9%',
  card: '0 0% 100%',
  cardForeground: '222.2 84% 4.9%',
  popover: '0 0% 100%',
  popoverForeground: '222.2 84% 4.9%',
  primary: '221 83% 53%',
  primaryForeground: '210 40% 98%',
  secondary: '222 47% 33%',
  secondaryForeground: '210 40% 98%',
  accent: '34 100% 47%',
  accentForeground: '210 40% 98%',
  muted: '210 40% 96.1%',
  mutedForeground: '215.4 16.3% 46.9%',
  destructive: '0 84.2% 60.2%',
  destructiveForeground: '210 40% 98%',
  success: '84 70% 44%',
  successForeground: '210 40% 98%',
  warning: '38 92% 50%',
  warningForeground: '222.2 47.4% 11.2%',
  border: '214.3 31.8% 91.4%',
  input: '214.3 31.8% 91.4%',
  ring: '221 83% 53%',
  radius: '0.5rem',
};

/** Dark theme baseline. */
export const THEME_BASELINE_DARK: ThemeTokens = {
  background: '222.2 47.4% 11.2%',
  foreground: '210 40% 98%',
  card: '222.2 47.4% 11.2%',
  cardForeground: '210 40% 98%',
  popover: '222.2 47.4% 11.2%',
  popoverForeground: '210 40% 98%',
  primary: '221 83% 65%',
  primaryForeground: '0 0% 100%',
  secondary: '222 47% 33%',
  secondaryForeground: '0 0% 100%',
  accent: '34 100% 55%',
  accentForeground: '0 0% 0%',
  muted: '217.2 32.6% 20%',
  mutedForeground: '215 20.2% 75.1%',
  destructive: '0 74% 45%',
  destructiveForeground: '0 0% 100%',
  success: '84 70% 45%',
  successForeground: '0 0% 100%',
  warning: '38 92% 60%',
  warningForeground: '0 0% 0%',
  border: '217.2 32.6% 25%',
  input: '217.2 32.6% 25%',
  ring: '224.3 76.3% 60%',
  radius: '0.5rem',
};

/** Brand override: only set tokens you want to change (e.g. primary for brand color). */
export type ThemeOverride = Partial<ThemeTokens>;

/** Merge baseline with override; derived projects use this to apply brand/focus. */
export function mergeTheme(baseline: ThemeTokens, override: ThemeOverride): ThemeTokens {
  return { ...baseline, ...override };
}
