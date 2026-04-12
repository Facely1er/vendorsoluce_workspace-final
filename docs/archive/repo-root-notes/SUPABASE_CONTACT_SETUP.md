# Supabase Contact Form & Auth Setup

Complete setup for the ERMITS contact form, auth, and database used by CyberCaution, CyberCorrect, VendorSoluce, CyberSoluce, and TechnoSoluce.

> **Security:** Never paste database passwords or connection strings into chat, logs, or version control. If you have exposed credentials, rotate them immediately in Supabase Dashboard → Project Settings → Database → Reset database password.
---

## Quick: Complete in Supabase (Dashboard + CLI)

1. **Create table (SQL Editor)**  
   - Dashboard → [SQL Editor](https://supabase.com/dashboard/project/dfklqsdfycwjlcasfciu/sql/new) → New query  
   - Paste the contents of `supabase/contact-form-setup.sql` and run.

2. **Deploy contact-form Edge Function**  
   ```powershell
   cd packages/app
   npx supabase login
   npx supabase link --project-ref dfklqsdfycwjlcasfciu
   npx supabase functions deploy contact-form --no-verify-jwt
   ```

3. **Set Edge Function secrets**  
   - Dashboard → Edge Functions → **contact-form** → Manage secrets  
   - Add `RESEND_API_KEY` (from [resend.com](https://resend.com))  
   - Optionally `EMAIL_FROM` = `VendorSoluce Contact <noreply@vendorsoluce.com>`

4. **Test**  
   ```powershell
   curl.exe -X POST "https://dfklqsdfycwjlcasfciu.supabase.co/functions/v1/contact-form" -H "Content-Type: application/json" -d "{\"name\":\"Test\",\"email\":\"test@example.com\",\"message\":\"ping\"}"
   ```  
   Expect `{"success":true,"message":"Contact form submitted successfully","id":"..."}`

---

## 1. Supabase Project

**Project reference:** `dfklqsdfycwjlcasfciu`  
**Project URL:** `https://dfklqsdfycwjlcasfciu.supabase.co`

### 1.1 Get API credentials

1. Supabase Dashboard → **Project Settings** → **API**
2. Copy:
   - **Project URL** → use as `VITE_SUPABASE_URL`
   - **anon public** key → use as `VITE_SUPABASE_ANON_KEY`

### 1.2 Database connection (optional)

For migrations or direct DB access:
- **Host:** `db.dfklqsdfycwjlcasfciu.supabase.co`
- **Port:** `5432`
- **Database:** `postgres`
- **User:** `postgres`
- **Password:** from Supabase Dashboard → **Project Settings** → **Database**

**Security:** Never commit database URLs or passwords to git. Use `.env.local` (gitignored) and rotate credentials if exposed.

---

## 2. Environment variables (VendorSoluce app)

Create `packages/app/.env.local`:

```env
# Required for auth, contact form, and data
VITE_SUPABASE_URL=https://dfklqsdfycwjlcasfciu.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

Get the anon key from Supabase Dashboard → Project Settings → API.

---

## 3. Contact form edge function (RESEND)

The `contact-form` edge function emails submissions to contact@ermits.com via [Resend](https://resend.com).

### 3.1 Get Resend API key

1. Sign up at [resend.com](https://resend.com)
2. **API Keys** → Create API Key
3. Copy the key (starts with `re_`)

### 3.2 Set Supabase Edge Function secrets

1. Supabase Dashboard → **Edge Functions** → **contact-form**
2. **Manage secrets** (or Project Settings → Edge Functions)
3. Add:
   - `RESEND_API_KEY` = your Resend API key
   - `EMAIL_FROM` (optional) = e.g. `VendorSoluce Contact <noreply@vendorsoluce.com>`

Or via Supabase CLI:

```bash
supabase secrets set RESEND_API_KEY=re_your_key_here
supabase secrets set EMAIL_FROM="VendorSoluce Contact <noreply@vendorsoluce.com>"
```

Without `RESEND_API_KEY`, submissions are still saved to the database but emails are not sent.

---

## 4. Database: vs_contact_submissions

The table is created by migrations. If needed, run migrations:

```bash
cd packages/app
supabase db push
```

Or apply migrations manually via SQL Editor (Supabase Dashboard → SQL Editor) in order:
- `supabase/migrations/20250701042959_crimson_waterfall.sql` (creates `contact_submissions`)
- `supabase/migrations/20251004090354_rename_tables_with_vs_prefix.sql` (renames to `vs_contact_submissions`)

**Schema:**

| Column      | Type         | Nullable |
|-------------|--------------|----------|
| id          | uuid         | PK       |
| first_name  | text         | NOT NULL |
| last_name   | text         | NOT NULL |
| email       | text         | NOT NULL |
| phone       | text         | NULL     |
| company     | text         | NULL     |
| topic       | text         | NULL     |
| message     | text         | NOT NULL |
| status      | text         | NULL     |
| created_at  | timestamptz  | DEFAULT now() |

---

## 5. Verification checklist

- [ ] `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` set in Netlify / deploy env
- [ ] `RESEND_API_KEY` set in Supabase Edge Function secrets
- [ ] Migrations applied (vs_contact_submissions exists)
- [ ] Contact form tested on each site (CyberCaution, CyberCorrect, VendorSoluce)

---

## 6. Security

- **Rotate credentials** if you shared them in chat, logs, or commits
- Use **Supabase Dashboard** to reset database password: Project Settings → Database → Reset database password
- Revoke and regenerate **Resend API key** if exposed
- `.env.local` and `env.netlify` are gitignored; never add real credentials to example files
