# Supabase authentication setup

This app uses Supabase for sign-in, sign-up, password reset, and user profiles (`vs_profiles`). Follow these steps to complete the configuration.

## 1. Environment variables (app)

Create `packages/app/.env.local` (or set in your deployment platform) with:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

- **VITE_SUPABASE_URL**: Supabase project URL from [Dashboard](https://supabase.com/dashboard) → your project → **Settings** → **API** → Project URL.
- **VITE_SUPABASE_ANON_KEY**: Same page → Project API keys → **anon** (public) key.

Restart the dev server after changing env vars so Vite picks them up.

## 2. Supabase Dashboard – URL configuration

In [Supabase Dashboard](https://supabase.com/dashboard) → your project → **Authentication** → **URL Configuration**:

| Setting | Example (local) | Example (production) |
|--------|-------------------|----------------------|
| **Site URL** | `http://localhost:5173` | `https://platform.vendorsoluce.com` |
| **Redirect URLs** | `http://localhost:5173/**` | `https://platform.vendorsoluce.com/**` |

- **Site URL**: Where users land after email confirmation or password reset. Use your app’s origin.
- **Redirect URLs**: Add every origin you use (dev, staging, production). The `/**` suffix allows any path on that origin.

Without these, confirmation and password-reset links may not open in your app correctly.

## 3. Database (profiles and RLS)

The app expects a `vs_profiles` table and RLS policies. Apply the project migrations to your Supabase database:

```bash
# From monorepo root; requires SUPABASE_SERVICE_ROLE_KEY and SUPABASE_URL (or VITE_SUPABASE_URL)
node packages/app/scripts/apply-migrations.mjs
```

Or run the SQL in `packages/app/supabase/migrations/` manually in the Supabase SQL editor. Key migration for auth: `20251004090354_rename_tables_with_vs_prefix.sql` (or the equivalent that creates/renames to `vs_profiles`).

## 4. Optional: email confirmation

- **Development**: In Dashboard → **Authentication** → **Providers** → **Email**, you can turn **Confirm email** off so sign-ups work without clicking a link.
- **Production**: Keep **Confirm email** on. The app sends `emailRedirectTo: <your Site URL>` so confirmation links return users to your app; the client uses `detectSessionInUrl: true` to complete sign-in.

## 5. Verify

1. Start the app: `npm run dev --workspace=app`.
2. Open the sign-in page; the “Authentication is not configured” banner should be gone.
3. Sign up with an email/password; you should get a session (and, if email confirmation is on, an email).
4. Sign out and sign in again to confirm persistence.

If the banner still appears, ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set in `.env.local` and the dev server was restarted.
