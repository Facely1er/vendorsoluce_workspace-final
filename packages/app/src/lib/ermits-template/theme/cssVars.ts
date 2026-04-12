/**
 * Generate CSS custom properties from theme tokens.
 * Use in :root or .dark so all products share the same variable names (--background, --primary, etc.).
 */

import type { ThemeTokens } from './tokens';

const TOKEN_TO_CSS_VAR: Record<keyof ThemeTokens, string> = {
  background: '--background',
  foreground: '--foreground',
  card: '--card',
  cardForeground: '--card-foreground',
  popover: '--popover',
  popoverForeground: '--popover-foreground',
  primary: '--primary',
  primaryForeground: '--primary-foreground',
  secondary: '--secondary',
  secondaryForeground: '--secondary-foreground',
  accent: '--accent',
  accentForeground: '--accent-foreground',
  muted: '--muted',
  mutedForeground: '--muted-foreground',
  destructive: '--destructive',
  destructiveForeground: '--destructive-foreground',
  success: '--success',
  successForeground: '--success-foreground',
  warning: '--warning',
  warningForeground: '--warning-foreground',
  border: '--border',
  input: '--input',
  ring: '--ring',
  radius: '--radius',
};

/** Returns a CSS string of custom properties for the given tokens (e.g. for :root or .dark). */
export function themeToCssVars(tokens: ThemeTokens): string {
  return Object.entries(tokens)
    .map(([key, value]) => {
      const varName = TOKEN_TO_CSS_VAR[key as keyof ThemeTokens];
      return varName ? `${varName}: ${value};` : '';
    })
    .filter(Boolean)
    .join('\n');
}
