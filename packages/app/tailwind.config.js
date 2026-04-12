import { sharedTheme } from 'shared/tailwind-config';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  safelist: [
    // Progress bar dynamic widths (no-inline-styles)
    ...Array.from({ length: 101 }, (_, i) => `w-[${i}%]`),
    // Shell layout classes built via template literals in shell.ts — must be safelisted
    // so Tailwind's static scanner includes them in the compiled output.
    'pt-[var(--header-height)]',
    'pt-[calc(var(--header-height)_+_2.25rem)]',
    'top-[var(--header-height)]',
    'h-[calc(100vh_-_var(--header-height))]',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      ...sharedTheme.extend,
    },
  },
  plugins: [],
};
