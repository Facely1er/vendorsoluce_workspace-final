/**
 * Shared Tailwind configuration utilities
 */
import { vendorsoluceColors } from './tailwind-colors.js';

/**
 * Base Tailwind theme extension with VendorSoluce colors
 */
export const sharedTheme = {
  extend: {
    colors: vendorsoluceColors,
    boxShadow: {
      'card': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
    },
    animation: {
      'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    },
    fontFamily: {
      sans: ['Inter var', 'Inter', 'system-ui', 'sans-serif'],
    },
  },
};

