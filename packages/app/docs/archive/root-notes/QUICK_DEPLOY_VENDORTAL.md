# Quick Deploy VendorTal to Vercel

## Prerequisites ✅
- Vercel CLI installed (v48.6.0 detected)
- Code changes committed
- DNS access for vendortal.com

## Quick Deployment Steps

### 1. Add Domain in Vercel Dashboard (First Time Only)

1. Go to: https://vercel.com/dashboard
2. Select your **VendorSoluce** project
3. Go to **Settings** → **Domains**
4. Click **Add Domain**
5. Add: `vendortal.com`
6. Add: `www.vendortal.com`
7. Copy the DNS records provided by Vercel

### 2. Configure DNS (First Time Only)

Add DNS records at your domain registrar:

**For vendortal.com:**
- Type: A or CNAME (Vercel will specify)
- Value: Provided by Vercel dashboard
- TTL: 3600

**For www.vendortal.com:**
- Type: CNAME
- Value: Provided by Vercel dashboard
- TTL: 3600

### 3. Set Environment Variables in Vercel

Go to **Settings** → **Environment Variables** and add:

```
VITE_VENDOR_PORTAL_URL=https://vendortal.com
VITE_VENDOR_PORTAL_DOMAIN=vendortal.com
```

Apply to: **Production**, **Preview**, and **Development**

### 4. Deploy

**Option A: Using PowerShell Script (Recommended)**
```powershell
.\deploy-vendortal.ps1
```

**Option B: Manual Deployment**
```powershell
# Build and deploy
npm run build
vercel --prod
```

**Option C: Git Push (If connected to Git)**
```powershell
git add .
git commit -m "Deploy vendortal.com domain support"
git push
# Vercel will auto-deploy
```

## Verification

After deployment:

1. **Check DNS:** `nslookup vendortal.com`
2. **Test URL:** https://vendortal.com (wait 5-10 min for DNS/SSL)
3. **Verify:** Should show vendor portal landing page
4. **Check SSL:** Padlock icon should appear

## Troubleshooting

- **DNS not resolving?** Wait up to 48 hours (usually < 1 hour)
- **SSL not working?** Wait 5-10 minutes after DNS propagation
- **Wrong content?** Clear cache, check environment variables
- **Build errors?** Check Vercel deployment logs

## Need Help?

See `DEPLOY_VENDORTAL.md` for detailed instructions.

