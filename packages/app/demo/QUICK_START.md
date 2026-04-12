# 🚀 Demo Quick Start

## Local Development

```bash
# Preview the demo
npm run preview:demo

# Or use any static server
npx serve demo
```

Visit: `http://localhost:3000`

## Build for Deployment

```bash
npm run build:demo
```

This copies `demo/` to `dist-demo/` ready for deployment.

## Deploy to Vercel

1. **Create new project:**
   ```bash
   vercel --prod
   ```

2. **Configure in Vercel Dashboard:**
   - Build Command: `npm run build:demo`
   - Output Directory: `dist-demo`
   - Framework: Other

3. **Add subdomain:**
   - Settings → Domains
   - Add `demo.vendorsoluce.com`

## File Structure

- `index.html` - Main page
- `assets/css/demo.css` - Styles
- `assets/js/demo.js` - JavaScript
- `screenshots/` - Screenshot placeholders

## Customization

1. **Add screenshots**: Place images in `screenshots/` and update HTML
2. **Modify content**: Edit `index.html` directly
3. **Change styles**: Update `assets/css/demo.css`
4. **Update links**: Change URLs in `index.html` to point to your production site

## Notes

- ✅ No build process needed for development
- ✅ Pure static HTML - works anywhere
- ✅ Fast loading - no React bundle
- ✅ SEO-friendly
- ✅ Mobile responsive

