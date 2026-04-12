# 🎯 Demo/Trial Version Deployment Guide

This guide explains how to build and deploy a separate demo/trial version of VendorSoluce on a subdomain.

## Overview

The demo version is a **static HTML showcase** designed for content-heavy demonstrations. It's built separately from the production React app and can be deployed to a subdomain like `demo.vendorsoluce.com` or `trial.vendorsoluce.com`.

## Key Features

- ✅ **Static HTML** - No build process, fast loading
- ✅ **Content-focused** - Perfect for showcasing features and screenshots
- ✅ **Separate output directory** (`dist-demo`)
- ✅ **Responsive design** - Works on all devices
- ✅ **SEO-friendly** - Great for marketing and discovery
- ✅ **Easy to customize** - Simple HTML/CSS/JS structure
- ✅ **Deploy anywhere** - Works on any static hosting service

---

## 📋 Prerequisites

1. Node.js 18+ installed
2. Vercel account and CLI installed
3. Separate Supabase project for demo (recommended)
4. Stripe test mode keys

---

## 🚀 Quick Start

### Step 1: Set Up Environment Variables

1. Copy the demo environment template:
   ```bash
   cp .env.demo.example .env.demo
   ```

2. Edit `.env.demo` and fill in your demo credentials:
   ```env
   VITE_APP_ENV=demo
   VITE_SUPABASE_URL=https://your-demo-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_demo_anon_key
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
   # ... etc
   ```

### Step 2: Preview Demo Locally

Preview the static HTML demo:
```bash
npm run preview:demo
```

Or use any static server:
```bash
# Using npx serve
npx serve demo

# Using Python
cd demo && python -m http.server 8000

# Using Node.js http-server
npx http-server demo -p 8000
```

The demo will be available at `http://localhost:3000` (or your chosen port)

### Step 3: Build for Deployment

Build the demo for deployment (copies to `dist-demo/`):
```bash
npm run build:demo
```

This copies the `demo/` folder to `dist-demo/` for deployment.

---

## 🌐 Deploying to Vercel Subdomain

### Option A: Deploy as Separate Vercel Project (Recommended)

1. **Create a new Vercel project for demo:**
   ```bash
   # Navigate to your project directory
   cd vendorsoluce.com
   
   # Link to a new Vercel project
   vercel --prod
   # When prompted, create a new project named "vendorsoluce-demo"
   ```

2. **Configure environment variables in Vercel Dashboard:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Select your `vendorsoluce-demo` project
   - Go to **Settings** → **Environment Variables**
   - Add all variables from `.env.demo.example`
   - Set environment to **Production** for all variables

3. **Configure build settings:**
   - Go to **Settings** → **General**
   - Set **Build Command** to: `npm run build:demo`
   - Set **Output Directory** to: `dist-demo`
   - Set **Framework Preset** to: `Vite`

4. **Set up custom domain:**
   - Go to **Settings** → **Domains**
   - Add your demo subdomain: `demo.vendorsoluce.com`
   - Follow DNS configuration instructions

5. **Deploy:**
   ```bash
   vercel --prod
   ```

### Option B: Use Vercel Configuration File

1. **Create a separate branch for demo:**
   ```bash
   git checkout -b demo
   ```

2. **Copy demo Vercel config:**
   ```bash
   cp vercel.demo.json vercel.json
   ```

3. **Deploy the demo branch:**
   ```bash
   vercel --prod
   ```

4. **Configure subdomain in Vercel Dashboard** (same as Option A, step 4)

---

## 🔧 Configuration Details

### Demo Structure

The demo is a static HTML site located in the `demo/` folder:

```
demo/
├── index.html              # Main landing page
├── assets/
│   ├── css/demo.css       # All styles
│   ├── js/demo.js         # Minimal JavaScript
│   └── images/            # Images and assets
├── screenshots/           # Screenshot placeholders
└── README.md             # Demo documentation
```

### Features

- **No build process** - Edit HTML directly
- **Fast loading** - No React bundle, just static files
- **SEO optimized** - Proper meta tags and semantic HTML
- **Responsive** - Mobile-friendly design
- **Interactive** - Smooth scrolling, animations, mobile menu
- **Easy to customize** - Simple HTML/CSS structure

### Customization

- **Content**: Edit `demo/index.html` directly
- **Styling**: Modify `demo/assets/css/demo.css`
- **Interactivity**: Update `demo/assets/js/demo.js`
- **Screenshots**: Add images to `demo/screenshots/` and update HTML

---

## 📁 Project Structure

```
vendorsoluce.com/
├── dist/              # Production build output
├── dist-demo/         # Demo build output
├── .env.demo          # Demo environment variables (not in git)
├── .env.demo.example  # Demo environment template
├── vercel.json        # Production Vercel config
├── vercel.demo.json   # Demo Vercel config
└── vite.config.ts     # Build config (supports both modes)
```

---

## 🔐 Security Considerations

### Recommended Setup

1. **Separate Supabase Project**: Use a dedicated Supabase project for demo to:
   - Isolate demo data from production
   - Apply different RLS policies
   - Limit resource usage

2. **Stripe Test Mode**: Always use Stripe test keys (`pk_test_...`) for demo

3. **Separate Analytics**: Use a separate Google Analytics property for demo tracking

4. **Rate Limiting**: Demo has lower rate limits to prevent abuse

### Environment Variables Security

- Never commit `.env.demo` to git
- Use Vercel environment variables for sensitive data
- Rotate keys if accidentally exposed

---

## 🧪 Testing Demo Build

### Local Testing

1. Build demo version:
   ```bash
   npm run build:demo
   ```

2. Preview locally:
   ```bash
   npm run preview:demo
   ```

3. Verify demo mode detection:
   - Open browser console
   - Check `window.__APP_CONFIG__` (in dev mode)
   - Verify app name shows "(Demo)"

### Production Testing

1. Deploy to Vercel preview:
   ```bash
   vercel
   ```

2. Test on preview URL

3. Verify all features work correctly

---

## 📝 NPM Scripts

| Script | Description |
|--------|-------------|
| `npm run build:demo` | Copy demo folder to `dist-demo/` for deployment |
| `npm run preview:demo` | Preview demo locally using serve |
| `npm run build:demo:react` | Build React demo version (if needed) |
| `npm run build` | Build production React version (unchanged) |
| `npm run preview` | Preview production build (unchanged) |

---

## 🐛 Troubleshooting

### Build Fails

**Issue**: Build command fails
**Solution**: 
- Ensure all dependencies are installed: `npm install`
- Check TypeScript errors: `npm run type-check`
- Verify environment variables are set

### Demo Mode Not Detected

**Issue**: App doesn't show demo branding
**Solution**:
- Verify `VITE_APP_ENV=demo` is set in environment
- Check hostname contains `demo.` or `trial.`
- Clear browser cache and rebuild

### Vercel Deployment Issues

**Issue**: Wrong build output
**Solution**:
- Verify build command: `npm run build:demo`
- Verify output directory: `dist-demo`
- Check Vercel build logs for errors

---

## 🔄 Updating Demo Version

To update the demo after making changes:

1. **Make your code changes**

2. **Test locally:**
   ```bash
   npm run build:demo
   npm run preview:demo
   ```

3. **Deploy:**
   ```bash
   vercel --prod
   ```

Or push to your demo branch and Vercel will auto-deploy if configured.

---

## 📞 Support

For issues or questions:
- Check build logs in Vercel Dashboard
- Review environment variable configuration
- Verify DNS settings for subdomain

---

## ✅ Checklist

Before deploying demo:

- [ ] Created `.env.demo` with all required variables
- [ ] Tested demo build locally (`npm run build:demo`)
- [ ] Verified demo mode detection works
- [ ] Set up separate Supabase project (recommended)
- [ ] Configured Stripe test keys
- [ ] Created Vercel project for demo
- [ ] Configured custom subdomain
- [ ] Tested deployment on preview URL
- [ ] Verified all features work in demo mode

---

**Last Updated**: January 2025

