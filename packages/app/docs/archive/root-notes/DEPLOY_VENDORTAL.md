# Deploy VendorTal on Vercel

This guide walks you through deploying vendortal.com on Vercel alongside vendorsoluce.com.

## Prerequisites

- Vercel account with access to the VendorSoluce project
- DNS access for vendortal.com domain
- Environment variables configured

## Step 1: Add Domain in Vercel Dashboard

1. **Go to Vercel Dashboard:**
   - Navigate to https://vercel.com/dashboard
   - Select your VendorSoluce project

2. **Add Domain:**
   - Go to **Settings** → **Domains**
   - Click **Add Domain**
   - Enter: `vendortal.com`
   - Click **Add**
   - Repeat for `www.vendortal.com`

3. **Verify Domain Ownership:**
   - Vercel will provide DNS records to add
   - You'll need to add these to your DNS provider

## Step 2: Configure DNS

Add these DNS records to your domain registrar:

### Option A: Using A Records (Recommended)

```
Type: A
Name: @
Value: 76.76.21.21
TTL: 3600

Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

### Option B: Using CNAME (Alternative)

```
Type: CNAME
Name: @
Value: cname.vercel-dns.com
TTL: 3600

Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

**Note:** Vercel will provide the exact DNS values in the dashboard. Use those values.

## Step 3: Configure Environment Variables

Add these environment variables in Vercel:

1. **Go to Settings → Environment Variables**
2. **Add/Update these variables:**

```bash
# Vendor Portal Domain (Required)
VITE_VENDOR_PORTAL_URL=https://vendortal.com
VITE_VENDOR_PORTAL_DOMAIN=vendortal.com

# Main App URL (if not already set)
VITE_APP_URL=https://vendorsoluce.com

# Existing variables (ensure these are set)
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

3. **Apply to all environments:**
   - Production
   - Preview
   - Development

## Step 4: Deploy

### Option A: Automatic Deployment (Git Integration)

If your project is connected to Git:

1. **Push changes to your repository:**
   ```bash
   git add .
   git commit -m "Add vendortal.com domain support"
   git push
   ```

2. **Vercel will automatically deploy**
   - Check deployment status in Vercel dashboard
   - Wait for build to complete

### Option B: Manual Deployment (Vercel CLI)

1. **Install Vercel CLI (if not installed):**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy to production:**
   ```bash
   vercel --prod
   ```

4. **Follow prompts:**
   - Select your project
   - Confirm deployment

## Step 5: Verify Deployment

1. **Check DNS Propagation:**
   ```bash
   # Check if DNS is resolving
   nslookup vendortal.com
   dig vendortal.com
   ```

2. **Test Domains:**
   - https://vendortal.com → Should show vendor portal
   - https://www.vendortal.com → Should show vendor portal
   - https://vendorsoluce.com → Should show full platform

3. **Verify SSL:**
   - Vercel automatically provisions SSL certificates
   - Wait 5-10 minutes after DNS propagation
   - Check: https://vendortal.com (should show padlock)

## Step 6: Test Functionality

### Test Vendor Portal Domain

1. **Access vendor portal:**
   - Visit https://vendortal.com
   - Should show vendor portal landing page
   - No navbar/footer (minimal UI)

2. **Test assessment access:**
   - Use a test assessment ID
   - Navigate to `/vendor-assessments/{id}`
   - Verify it works correctly

### Test Main Domain

1. **Access main platform:**
   - Visit https://vendorsoluce.com
   - Should show full VendorSoluce platform
   - Footer should have "For Vendors" link

2. **Verify footer link:**
   - Click "For Vendors" → "Vendor Assessment Portal"
   - Should open vendortal.com in new tab

## Troubleshooting

### DNS Not Resolving

- **Wait for propagation:** DNS changes can take up to 48 hours (usually < 1 hour)
- **Check DNS records:** Verify records match Vercel's requirements
- **Use DNS checker:** https://dnschecker.org

### SSL Certificate Issues

- **Wait 5-10 minutes** after DNS propagation
- **Check Vercel dashboard** → Domains → SSL status
- **Force SSL renewal:** Remove and re-add domain if needed

### Domain Shows Wrong Content

- **Clear browser cache**
- **Check environment variables** are set correctly
- **Verify deployment** includes latest code changes
- **Check domain detection** logic in browser console

### Build Errors

- **Check build logs** in Vercel dashboard
- **Verify environment variables** are set
- **Check TypeScript errors:** `npm run type-check`
- **Check linting:** `npm run lint`

## Environment Variables Checklist

Ensure these are set in Vercel:

- ✅ `VITE_VENDOR_PORTAL_URL` = `https://vendortal.com`
- ✅ `VITE_VENDOR_PORTAL_DOMAIN` = `vendortal.com`
- ✅ `VITE_APP_URL` = `https://vendorsoluce.com`
- ✅ `VITE_SUPABASE_URL` = (your Supabase URL)
- ✅ `VITE_SUPABASE_ANON_KEY` = (your Supabase anon key)
- ✅ Other required variables (check your `.env` files)

## Post-Deployment Checklist

- [ ] DNS records added and propagated
- [ ] Domain added in Vercel dashboard
- [ ] SSL certificate issued (check padlock icon)
- [ ] Environment variables configured
- [ ] Deployment successful
- [ ] vendortal.com shows vendor portal
- [ ] vendorsoluce.com shows full platform
- [ ] Footer link works correctly
- [ ] Assessment portal accessible
- [ ] Email invitation links use vendortal.com

## Support

If you encounter issues:

1. Check Vercel deployment logs
2. Verify DNS configuration
3. Check environment variables
4. Review domain detection logic: `src/utils/domainDetection.ts`
5. Check Vercel documentation: https://vercel.com/docs

## Quick Reference

**Vercel Dashboard:** https://vercel.com/dashboard  
**Domain Settings:** Settings → Domains  
**Environment Variables:** Settings → Environment Variables  
**Deployment Logs:** Deployments → [Select deployment] → Build Logs

