# Move vendortal.com Domain - Step by Step

## Current Status
- ✅ Domain: vendortal.com exists
- ✅ DNS: Configured correctly (ns1.vercel-dns.com, ns2.vercel-dns.com)
- ⚠️ Currently assigned to: **vendorportal** project
- 🎯 Should be in: **05-vendorsoluce** project

## Option 1: Try Adding Directly (Easiest)

Sometimes Vercel will automatically move the domain when you add it to a new project:

1. **Go to:** https://vercel.com/facelys-projects/05-vendorsoluce/settings/domains
2. **Click:** "Add Domain"
3. **Enter:** `vendortal.com`
4. **Click:** "Add"
5. **If it works:** Vercel will automatically remove it from vendorportal
6. **If error:** Proceed to Option 2

## Option 2: Remove Then Add (If Option 1 Fails)

### Step 1: Remove from vendorportal

1. **Go to:** https://vercel.com/facelys-projects/vendorportal/settings/domains
2. **Find:** `vendortal.com` and `www.vendortal.com`
3. **Click:** "Remove" for each
4. **Confirm:** Removal

### Step 2: Add to 05-vendorsoluce

1. **Go to:** https://vercel.com/facelys-projects/05-vendorsoluce/settings/domains
2. **Click:** "Add Domain"
3. **Enter:** `vendortal.com`
4. **Click:** "Add"
5. **Repeat:** Add `www.vendortal.com`

## Step 3: Set Environment Variables

1. **Go to:** https://vercel.com/facelys-projects/05-vendorsoluce/settings/environment-variables
2. **Add:**
   - `VITE_VENDOR_PORTAL_URL` = `https://vendortal.com`
   - `VITE_VENDOR_PORTAL_DOMAIN` = `vendortal.com`
3. **Apply to:** Production, Preview, Development
4. **Save**

## Step 4: Verify

After 1-2 minutes:

1. **Test:** https://vendortal.com
2. **Should show:** Vendor portal landing page
3. **Test:** https://www.vendortal.com
4. **Should show:** Vendor portal landing page

## Quick Links

- **05-vendorsoluce Domains:** https://vercel.com/facelys-projects/05-vendorsoluce/settings/domains
- **vendorportal Domains:** https://vercel.com/facelys-projects/vendorportal/settings/domains
- **Environment Variables:** https://vercel.com/facelys-projects/05-vendorsoluce/settings/environment-variables

## Notes

- ✅ No DNS changes needed - DNS is already configured
- ✅ SSL certificates will auto-generate (5-10 minutes)
- ⏱️ Domain assignment takes 1-2 minutes to propagate
- 🔄 If vendorportal project doesn't exist, try Option 1 first

