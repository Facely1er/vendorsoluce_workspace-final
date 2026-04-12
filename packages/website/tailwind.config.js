import { sharedTheme } from 'shared/tailwind-config';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './*.html',
    './legal/*.html',
    './includes/*.html',
    './radar/*.html',
    './assessment/*.html',
    './steel/*.html',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      ...sharedTheme.extend,
    },
  },
  plugins: [],
};
