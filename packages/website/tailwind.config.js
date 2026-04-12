/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./*.html",
    "./legal/*.html",
    "./includes/*.html",
    "./radar/*.html",
    "./assessment/*.html",
    "./steel/*.html",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'vendorsoluce-green': '#33691E',
        'vendorsoluce-light-green': '#66BB6A',
        'vendorsoluce-dark-green': '#2E5A1A',
        'vendorsoluce-pale-green': '#E8F5E8',
        'secure-green': '#33691E',
      }
    }
  },
  plugins: [],
}

