# Final Verification - Vendor Risk Portal Domain

## Current Status

The vendor risk portal is served at **www.portal.vendorsoluce.com** under VendorSoluce branding. (VendorTal / vendortal.com is not used for now.)

## Possible Reasons

1. **Propagation Delay:** Domain assignment changes can take 1-2 minutes to reflect in CLI
2. **Cache:** Vercel CLI may be showing cached information
3. **Assignment Not Complete:** Domain may still need to be removed from vendorportal first

## Verification Steps

### Step 1: Check Vercel Dashboard

Go to: **https://vercel.com/facelys-projects/05-vendorsoluce/settings/domains**

**Expected:**
- Should see `portal.vendorsoluce.com` or `www.portal.vendorsoluce.com` listed for the portal deploy

**If not listed:**
- Click "Add Domain"
- Enter `www.portal.vendorsoluce.com` (or your portal subdomain)

### Step 2: Check project domains

Go to your Vercel project **Domains** settings

**If vendortal.com is still there:**
- Remove `vendortal.com`
- Remove `www.vendortal.com`
- Then add to 05-vendorsoluce

### Step 3: Verify Environment Variables

Go to: **https://vercel.com/facelys-projects/05-vendorsoluce/settings/environment-variables**

**Required Variables:**
- `VITE_VENDOR_PORTAL_URL` = `https://vendortal.com`
- `VITE_VENDOR_PORTAL_DOMAIN` = `vendortal.com`

**Apply to:** Production, Preview, Development

### Step 4: Test Website

After domain assignment:

1. **Wait 1-2 minutes** for propagation
2. **Test:** https://vendortal.com
3. **Expected:** Vendor portal landing page (no navbar/footer)
4. **Test:** https://www.vendortal.com
5. **Expected:** Vendor portal landing page

### Step 5: Verify Domain Detection

- **vendortal.com** → Should show vendor portal only
- **vendorsoluce.com** → Should show full VendorSoluce platform

## CLI Verification Commands

After completing dashboard steps, wait 1-2 minutes, then run:

```bash
# Check domain assignment
vercel domains inspect vendortal.com

# Should show:
# Projects
#   Project            Domains
#   05-vendorsoluce    www.vendortal.com, vendortal.com
```

## Troubleshooting

### Domain Still Shows Wrong Project?

1. **Clear Vercel CLI cache:**
   ```bash
   # May need to wait or refresh
   ```

2. **Double-check dashboard:**
   - Verify domain is listed in 05-vendorsoluce project
   - Verify domain is NOT listed in vendorportal project

3. **Try removing and re-adding:**
   - Remove from both projects
   - Wait 1 minute
   - Add to 05-vendorsoluce only

### Website Not Loading?

1. **Check DNS:** `nslookup vendortal.com`
2. **Check SSL:** Wait 5-10 minutes for certificate generation
3. **Check deployment:** Ensure latest code is deployed
4. **Clear browser cache**

## Quick Links

- **05-vendorsoluce Domains:** https://vercel.com/facelys-projects/05-vendorsoluce/settings/domains
- **vendorportal Domains:** https://vercel.com/facelys-projects/vendorportal/settings/domains
- **Environment Variables:** https://vercel.com/facelys-projects/05-vendorsoluce/settings/environment-variables
- **Deployments:** https://vercel.com/facelys-projects/05-vendorsoluce/deployments

## Success Criteria

✅ Domain listed in 05-vendorsoluce project (dashboard)  
✅ Domain NOT listed in vendorportal project (dashboard)  
✅ Environment variables set  
✅ https://vendortal.com shows vendor portal  
✅ Marketing site https://www.vendorsoluce.com; platform https://www.platform.vendorsoluce.com  
✅ Domain detection works correctly

