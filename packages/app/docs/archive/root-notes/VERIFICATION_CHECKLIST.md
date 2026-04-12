# VendorTal Domain Verification Checklist

## ✅ Domain Assignment Verification

### Check 1: Domain Assignment
Run: `vercel domains inspect vendortal.com`

**Expected Result:**
```
Projects
  Project            Domains
  05-vendorsoluce    www.vendortal.com, vendortal.com
```

### Check 2: Environment Variables
Run: `vercel env ls 05-vendorsoluce production`

**Expected Variables:**
- `VITE_VENDOR_PORTAL_URL` = `https://vendortal.com`
- `VITE_VENDOR_PORTAL_DOMAIN` = `vendortal.com`

### Check 3: DNS Resolution
Run: `nslookup vendortal.com`

**Expected Result:**
- Should resolve to Vercel IP addresses
- Nameservers: ns1.vercel-dns.com, ns2.vercel-dns.com

### Check 4: Website Access
Test URLs:
- https://vendortal.com → Should show vendor portal landing page
- https://www.vendortal.com → Should show vendor portal landing page
- https://vendorsoluce.com → Should show full VendorSoluce platform

### Check 5: SSL Certificate
- Check padlock icon in browser
- Should show valid SSL certificate
- Certificate auto-generates 5-10 minutes after domain assignment

## Verification Steps

1. **Domain Assignment:**
   ```bash
   vercel domains inspect vendortal.com
   ```
   ✅ Should show: `05-vendorsoluce` project

2. **Environment Variables:**
   ```bash
   vercel env ls 05-vendorsoluce production
   ```
   ✅ Should show: `VITE_VENDOR_PORTAL_URL` and `VITE_VENDOR_PORTAL_DOMAIN`

3. **Test Website:**
   - Open: https://vendortal.com
   - ✅ Should show: Vendor portal landing page (no navbar/footer)
   - ✅ Should show: "Vendor Assessment Portal" title

4. **Test Domain Detection:**
   - Open: https://vendortal.com → Vendor portal
   - Open: https://vendorsoluce.com → Full platform
   - ✅ Different content based on domain

## Troubleshooting

### Domain Not Showing Correct Content?
- Clear browser cache
- Check environment variables are set
- Verify deployment includes latest code
- Wait 1-2 minutes for propagation

### SSL Not Working?
- Wait 5-10 minutes after domain assignment
- Check Vercel dashboard → Domains → SSL status
- Verify DNS is pointing to Vercel

### Wrong Project Assignment?
- Check: `vercel domains inspect vendortal.com`
- If wrong project, remove and re-add via dashboard

## Quick Links

- **Domain Settings:** https://vercel.com/facelys-projects/05-vendorsoluce/settings/domains
- **Environment Variables:** https://vercel.com/facelys-projects/05-vendorsoluce/settings/environment-variables
- **Deployments:** https://vercel.com/facelys-projects/05-vendorsoluce/deployments

