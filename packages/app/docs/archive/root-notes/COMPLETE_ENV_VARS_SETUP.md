# 🔐 Complete Environment Variables Setup

## Quick Setup Guide

Since Supabase secrets must be set via Dashboard, here's the exact process:

### Step 1: Get Resend API Key

1. Go to: https://resend.com/api-keys
2. Sign in or create account
3. Click **Create API Key**
4. Name it: `VendorSoluce Production`
5. Copy the API key (starts with `re_`)

### Step 2: Set Secrets in Supabase

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard/project/dfklqsdfycwjlcasfciu
   - Or: https://supabase.com/dashboard → Select your project

2. **Navigate to Secrets**
   - Click **Project Settings** (gear icon in left sidebar)
   - Click **Edge Functions** in the settings menu
   - Click **Secrets** tab

3. **Add Each Secret**

   **Secret 1: RESEND_API_KEY**
   - Click **Add Secret** or **New Secret**
   - Name: `RESEND_API_KEY`
   - Value: Your Resend API key (e.g., `re_xxxxxxxxxxxxx`)
   - Click **Save**

   **Secret 2: EMAIL_FROM**
   - Click **Add Secret** or **New Secret**
   - Name: `EMAIL_FROM`
   - Value: `VendorSoluce <noreply@vendorsoluce.com>`
   - Click **Save**

   **Secret 3: SITE_URL**
   - Click **Add Secret** or **New Secret**
   - Name: `SITE_URL`
   - Value: `https://vendorsoluce.com`
   - Click **Save**

### Step 3: Verify Secrets

After adding all 3 secrets, you should see them listed in the Secrets section.

### ✅ That's It!

Once all 3 secrets are set, your edge functions will be able to:
- ✅ Send email notifications
- ✅ Use proper email addresses
- ✅ Generate correct links in emails

---

## Alternative: Using Supabase CLI

If you have Supabase CLI installed and authenticated:

```powershell
# Login first
npx supabase login

# Link to project
npx supabase link --project-ref dfklqsdfycwjlcasfciu

# Set secrets
npx supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxx
npx supabase secrets set EMAIL_FROM="VendorSoluce <noreply@vendorsoluce.com>"
npx supabase secrets set SITE_URL=https://vendorsoluce.com
```

---

## 🧪 Test After Setup

Once secrets are set, test the system:

1. **Create a test user**
2. **Navigate to `/onboarding`**
3. **Check email** - Should receive trial started notification
4. **Verify in database** - Trial should be created

---

## 📋 Checklist

- [ ] Resend API key obtained
- [ ] RESEND_API_KEY secret added
- [ ] EMAIL_FROM secret added
- [ ] SITE_URL secret added
- [ ] All 3 secrets verified in Dashboard
- [ ] Test user created and trial started
- [ ] Email notification received

---

**Time Required:** 2-3 minutes  
**Difficulty:** Easy (just copy/paste values)

