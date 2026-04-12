# Supply Chain Risk Assessment - Static HTML Module

This is a fully client-side assessment module extracted from the React app. It runs completely in the browser with no backend dependencies.

## Features

- ✅ Fully client-side (no authentication required)
- ✅ localStorage persistence
- ✅ PDF report generation
- ✅ JSON export
- ✅ English/French translations
- ✅ Responsive design with dark mode support

## Local Development

### Option 1: Using npm script (Recommended)

```bash
cd packages/website
npm run serve
```

Then open: `http://localhost:8080/assessment/`

### Option 2: Using Python

```bash
cd packages/website
python -m http.server 8080
```

Then open: `http://localhost:8080/assessment/`

### Option 3: Using Node.js http-server

```bash
cd packages/website
npx http-server . -p 8080 -c-1 --cors
```

Then open: `http://localhost:8080/assessment/`

## Important Notes

⚠️ **Do NOT open the HTML file directly** (file:// protocol). ES6 modules require HTTP/HTTPS protocol.

The page will show an error message if opened directly. Always use a local web server.

## Production Deployment

This module is ready for deployment on:
- Vercel (configured via `vercel.json`)
- Netlify
- Any static hosting service

The assessment is accessible at:
- `/assessment/`
- `/start` (redirects to `/assessment/`)

## File Structure

```
assessment/
├── index.html          # Main entry point
├── assessment.js       # Core application logic
├── assessment-data.js  # Question/section data
├── i18n.js            # Translation helper
├── storage.js         # localStorage utilities
├── pdf-generator.js   # PDF report generation
├── styles.css         # Custom styles
└── locales/
    ├── en.json        # English translations
    └── fr.json        # French translations
```

## Browser Compatibility

- Modern browsers with ES6 module support
- Chrome/Edge 61+
- Firefox 60+
- Safari 11+
