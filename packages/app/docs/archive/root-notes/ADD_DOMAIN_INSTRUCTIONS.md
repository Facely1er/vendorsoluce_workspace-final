# Add vendortal.com Domain to Project

## Current Status

✅ **Domain exists:** vendortal.com is already in your Vercel account  
✅ **DNS configured:** Nameservers are set to Vercel (ns1.vercel-dns.com, ns2.vercel-dns.com)  
⚠️ **Domain assigned to:** "vendorportal" project  
🎯 **Target project:** "05-vendorsoluce"

## Option 1: Add Domain via Vercel Dashboard (Recommended)

1. **Go to Project Settings:**
   - https://vercel.com/facelys-projects/05-vendorsoluce/settings/domains

2. **Add Domain:**
   - Click **"Add Domain"**
   - Enter: `vendortal.com`
   - Click **"Add"**
   - If it says "already assigned to another project", you'll need to remove it from "vendorportal" first

3. **Remove from Old Project (if needed):**
   - Go to: https://vercel.com/facelys-projects/vendorportal/settings/domains
   - Remove `vendortal.com` and `www.vendortal.com`
   - Then add them to 05-vendorsoluce project

4. **Add www subdomain:**
   - In 05-vendorsoluce project settings → Domains
   - Add: `www.vendortal.com`

## Option 2: Move Domain via CLI

The CLI showed a warning about team membership. You can:

1. **Accept the move request** (if you have access to both projects)
2. **Or use the dashboard** to move the domain

## Option 3: Remove and Re-add

If you have access to the "vendorportal" project:

```bash
# Remove from old project (via dashboard or CLI)
# Then add to new project
vercel domains add vendortal.com 05-vendorsoluce
```

## After Adding Domain

1. **Set Environment Variables:**
   - Go to: https://vercel.com/facelys-projects/05-vendorsoluce/settings/environment-variables
   - Add:
     - `VITE_VENDOR_PORTAL_URL` = `https://vendortal.com`
     - `VITE_VENDOR_PORTAL_DOMAIN` = `vendortal.com`

2. **Redeploy (if needed):**
   ```bash
   vercel --prod
   ```

3. **Verify:**
   - https://vendortal.com → Should show vendor portal
   - https://www.vendortal.com → Should show vendor portal

## Quick Links

- **05-vendorsoluce Domains:** https://vercel.com/facelys-projects/05-vendorsoluce/settings/domains
- **vendorportal Domains:** https://vercel.com/facelys-projects/vendorportal/settings/domains
- **Environment Variables:** https://vercel.com/facelys-projects/05-vendorsoluce/settings/environment-variables

## DNS Status

✅ DNS is already configured correctly:
- Nameservers: ns1.vercel-dns.com, ns2.vercel-dns.com
- No DNS changes needed - just move the domain assignment

