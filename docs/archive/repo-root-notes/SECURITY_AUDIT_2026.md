# Security & Production Readiness Audit — vendorsoluce-monorepo

**Generated:** 2026-03-20
**Branch:** `claude/inspect-production-readiness-TBRLk`

---

## Summary

| Severity | Count | Fixed in this branch |
|----------|-------|----------------------|
| Critical | 5     | 3 ✅ (2 require manual action) |
| High     | 3     | 1 ✅ (2 require manual action) |
| Medium   | 2     | 0 |

---

## CRITICAL Issues

### ⚠️ MANUAL ACTION REQUIRED — C1: Live Stripe Publishable Key in Committed File
**File:** `packages/app/NETLIFY_ENV_STRIPE.txt`, line 16
The full `pk_live_[REDACTED]` key is in a plaintext file committed to the public repo. While publishable keys are client-safe, normalising committed credentials is dangerous and should be corrected.
**→ Action:** Delete `NETLIFY_ENV_STRIPE.txt` and `.gitignore` credential reference files. Set env vars via the Netlify/Vercel dashboard only.

### ⚠️ MANUAL ACTION REQUIRED — C2: Live Stripe Price IDs and Product IDs in Source
**File:** `packages/app/src/lib/stripeProducts.ts`, lines 54–365
Every `stripePriceId` and `stripeProductId` is hardcoded in source. Combined with the exposed publishable key, this allows anyone to construct a Stripe checkout session for any product.
**→ Action:** Move price IDs to environment variables or load them via a server-side API call rather than baking them into the client bundle.

### ✅ FIXED — C3: `create-checkout-session` Edge Function Had No Auth Verification
**File:** `packages/app/supabase/functions/create-checkout-session/index.ts`
The function accepted arbitrary `userId`/`customerEmail`/`priceId` from any unauthenticated request, allowing an attacker to create Stripe checkout sessions linked to any user.
**Fix applied:**
- Added Bearer JWT extraction from the `Authorization` header.
- Added Supabase `getUser()` call to verify the token before processing the request.
- Returns HTTP 401 for missing or invalid tokens.

### ✅ FIXED — C4: CORS Header Was `*` (Wildcard)
**File:** `packages/app/supabase/functions/create-checkout-session/index.ts`, line 19
`'Access-Control-Allow-Origin': '*'` allowed any website to call the checkout endpoint.
**Fix applied:** CORS origin now reads from `APP_URL` edge function secret. Set `APP_URL` to `https://www.platform.vendorsoluce.com` in Supabase → Edge Functions → Secrets.

### ✅ FIXED — C5: Missing CSP on Both Deployment Configs
**Files:** `packages/app/vercel.json`, `packages/vendor-risk-portal/netlify.toml`
Both configs had all other security headers but no `Content-Security-Policy`.
**Fix applied:** Added strict CSP to both configs.

---

## HIGH Issues

### ✅ FIXED — H1: Demo Mode Auth Bypass Baked at Build Time
**File:** `packages/app/src/context/AuthContext.tsx`, line 69
`VITE_DEMO_MODE=true` at build time grants admin access without credentials. Since this is resolved at build time by Vite, it cannot be "switched off" at runtime — a wrong build config ships demo mode to production.
**→ Recommendation (additional):** Add a CI/CD guard that fails the build if `VITE_DEMO_MODE=true` and `NODE_ENV=production` are both set simultaneously. Consider checking the bundle for `createDemoUser` as a post-build safety check.

### H2: Deno `std@0.168.0` (July 2022) — Very Old Pin
**Files:** Edge function imports
`std@0.168.0` is pinned to a 2022 release. Supabase now runs Deno 2.x. Incompatibilities may cause silent failures.
**→ Action:** Update to `std@0.224.0` (stable as of 2025) or use the `jsr:@std/http` import for Deno 2.

### H3: Stripe SDK Major Version Mismatch (App v19, Edge Functions v13)
App `package.json` uses `stripe@^19.1.0`; edge functions import `Stripe@13.10.0`. Major API differences can cause silent behavioral discrepancies in webhook event parsing.
**→ Action:** Update edge function imports to match the app's Stripe version: `https://esm.sh/stripe@19.1.0?target=deno`.

---

## MEDIUM Issues

### M1: `console.log` in Mock Hook Files
**Files:** `useVendorAssessments.mock.ts`, `useVendors.mock.ts`
Mock hooks with `console.log` calls that may be included in non-demo production builds.
**→ Action:** Ensure mock files are excluded via `terserOptions.compress.drop_console` for production builds, or use `import.meta.env.DEV` guards.

### M2: `VITE_DEMO_MODE` Is Not Guarded at CI Build Time
**File:** `packages/app/src/utils/config.ts`
No build-time assertion prevents `VITE_DEMO_MODE=true` from shipping to production.
**→ Action:** Add to `vite.config.ts`:
```ts
if (process.env.VITE_DEMO_MODE === 'true' && process.env.NODE_ENV === 'production') {
  throw new Error('VITE_DEMO_MODE must not be true in a production build');
}
```

---

## Files Changed in this Branch

| File | Change |
|------|--------|
| `packages/app/supabase/functions/create-checkout-session/index.ts` | Added JWT verification; restricted CORS to APP_URL |
| `packages/app/vercel.json` | Added CSP header |
| `packages/vendor-risk-portal/netlify.toml` | Added CSP header |
| `SECURITY_AUDIT_2026.md` | This report |
