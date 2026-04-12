/**
 * Theme baseline: consistent styling across CyberCaution, VendorSoluce, CyberCorrect.
 * Use the same token names; override only primary/accent (or other tokens) for brand/focus.
 */

export {
  THEME_BASELINE_LIGHT,
  THEME_BASELINE_DARK,
  mergeTheme,
} from './tokens';
export type { ThemeTokens, ThemeOverride } from './tokens';
export { themeToCssVars } from './cssVars';
