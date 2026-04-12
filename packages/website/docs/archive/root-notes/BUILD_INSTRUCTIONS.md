# VendorSoluce Build Instructions

## Tailwind CSS Build

VendorSoluce now uses compiled Tailwind CSS instead of the CDN. To build the CSS:

### First Time Setup

```bash
cd vendorsoluce-website
npm install
```

### Build CSS

```bash
npm run build:css
```

This will compile `src/tailwind.css` to `assets/css/tailwind.css`.

### Development (Watch Mode)

```bash
npm run watch:css
```

This will watch for changes and automatically rebuild the CSS.

### Important Notes

- The compiled CSS file (`assets/css/tailwind.css`) must be generated before deployment
- All HTML files now reference `assets/css/tailwind.css` instead of the CDN
- Make sure to run `npm run build:css` before committing changes

