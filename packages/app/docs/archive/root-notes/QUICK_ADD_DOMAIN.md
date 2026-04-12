# Quick Add vendortal.com Domain

## Current Situation

✅ Domain `vendortal.com` exists in your Vercel account  
✅ DNS is configured (nameservers: ns1.vercel-dns.com, ns2.vercel-dns.com)  
⚠️ Currently assigned to: **vendorportal** project  
🎯 Need to assign to: **05-vendorsoluce** project

## Quick Steps (Vercel Dashboard)

### Step 1: Remove from Old Project

1. Go to: **https://vercel.com/facelys-projects/vendorportal/settings/domains**
2. Find `vendortal.com` and `www.vendortal.com`
3. Click **"Remove"** for each domain
4. Confirm removal

### Step 2: Add to New Project

1. Go to: **https://vercel.com/facelys-projects/05-vendorsoluce/settings/domains**
2. Click **"Add Domain"**
3. Enter: `vendortal.com`
4. Click **"Add"**
5. Repeat for: `www.vendortal.com`

### Step 3: Set Environment Variables

1. Go to: **https://vercel.com/facelys-projects/05-vendorsoluce/settings/environment-variables**
2. Add these variables:
   ```
   VITE_VENDOR_PORTAL_URL=https://vendortal.com
   VITE_VENDOR_PORTAL_DOMAIN=vendortal.com
   ```
3. Apply to: **Production**, **Preview**, **Development**

### Step 4: Redeploy (Optional)

If you want to ensure the latest code is deployed:

```bash
cd 05-vendorsoluce
vercel --prod
```

## Verification

After completing the steps:

1. **Wait 1-2 minutes** for domain assignment to propagate
2. **Test:** https://vendortal.com
3. **Should show:** Vendor portal landing page
4. **Test:** https://www.vendortal.com
5. **Should show:** Vendor portal landing page

## Direct Links

- **05-vendorsoluce Domains:** https://vercel.com/facelys-projects/05-vendorsoluce/settings/domains
- **vendorportal Domains:** https://vercel.com/facelys-projects/vendorportal/settings/domains  
- **Environment Variables:** https://vercel.com/facelys-projects/05-vendorsoluce/settings/environment-variables

## Notes

- ✅ DNS is already configured - no DNS changes needed
- ✅ SSL certificates will auto-generate after domain assignment
- ⏱️ Domain assignment takes 1-2 minutes to propagate
- 🔒 SSL certificate takes 5-10 minutes after assignment

