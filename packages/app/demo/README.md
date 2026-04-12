# VendorSoluce Demo - Static HTML Version

This is a static HTML demo version of VendorSoluce designed for content-heavy showcase on a subdomain.

## Structure

```
demo/
├── index.html              # Main demo landing page
├── assets/
│   ├── css/
│   │   └── demo.css       # Demo-specific styles
│   ├── js/
│   │   └── demo.js        # Minimal JavaScript for interactivity
│   └── images/            # Demo images and screenshots
├── screenshots/           # Screenshot placeholders
└── README.md             # This file
```

## Features

- ✅ Fully static HTML (no build required)
- ✅ Responsive design
- ✅ Fast loading
- ✅ SEO-friendly
- ✅ Mobile menu support
- ✅ Smooth scrolling
- ✅ Intersection Observer animations

## Local Development

### Option 1: Using npx serve (Recommended)

```bash
npx serve demo
```

### Option 2: Using Python

```bash
cd demo
python -m http.server 8000
```

### Option 3: Using Node.js http-server

```bash
npx http-server demo -p 8000
```

Then visit `http://localhost:8000`

## Building for Deployment

The demo is automatically copied to `dist-demo/` when you run:

```bash
npm run build:demo
```

This prepares the static files for deployment to Vercel or any static hosting service.

## Deployment

### Deploy to Vercel

1. **Create a new Vercel project:**
   ```bash
   vercel --prod
   ```

2. **Configure in Vercel Dashboard:**
   - Build Command: `npm run build:demo`
   - Output Directory: `dist-demo`
   - Framework Preset: Other

3. **Add custom domain:**
   - Go to Settings → Domains
   - Add `demo.vendorsoluce.com` (or your preferred subdomain)

### Deploy to Other Static Hosts

Simply upload the contents of `dist-demo/` to your hosting service:
- Netlify
- GitHub Pages
- AWS S3 + CloudFront
- Any static file hosting

## Customization

### Adding Screenshots

1. Place screenshot images in `demo/screenshots/`
2. Update `index.html` to reference actual images:
   ```html
   <img src="screenshots/dashboard-demo.png" alt="Dashboard">
   ```

### Modifying Content

Edit `demo/index.html` directly. The structure is:
- Navigation
- Hero section
- Features section
- Screenshots gallery
- How it works
- CTA section
- Footer

### Styling

All styles are in `demo/assets/css/demo.css`. The CSS uses CSS variables for easy theming:

```css
:root {
  --vendorsoluce-green: #33691E;
  --vendorsoluce-light-green: #66BB6A;
  /* ... */
}
```

## Links

All links to the full application point to:
- `https://vendorsoluce.com/signin` - Sign in page
- `https://vendorsoluce.com/pricing` - Pricing page
- `https://vendorsoluce.com/how-it-works` - How it works page

Update these in `index.html` if your production URLs differ.

## Notes

- This is a **static demo** - no backend or database required
- All interactivity is handled by vanilla JavaScript
- No build step needed for development
- Perfect for showcasing features and content
- Can be deployed anywhere that serves static files

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

Uses modern CSS features (Grid, Flexbox, CSS Variables) and JavaScript (Intersection Observer).

