import { sharedTheme } from 'shared/tailwind-config';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    '../app/src/**/*.{js,ts,jsx,tsx}',
    '../shared/src/**/*.{ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      ...sharedTheme.extend,
    },
  },
  plugins: [],
};
