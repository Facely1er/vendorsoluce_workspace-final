# VendorSoluce release handoff

This package is prepared for clean external installs and deployment.

## Critical fixes included
- Root `package-lock.json` retained and normalized to `https://registry.npmjs.org/` tarball URLs.
- Root `.npmrc` points to the public npm registry.
- Root and site deploy configs use deterministic `npm ci --include=dev --no-audit` installs.
- Node runtime expectation is aligned to Node 20 at the repo root.

## Deploy targets
### Platform app
- Use repo root config: `netlify.toml` or `vercel.json`
- Build output: `packages/app/dist`

### Vendor risk portal
- Use `packages/vendor-risk-portal/netlify.toml`
- Build output: `packages/vendor-risk-portal/dist`

### Marketing website
- Netlify: set base directory to empty and config file to `packages/website/netlify.toml`
- Vercel: website config is in `packages/website/vercel.json`

## Final pre-release checks
1. Run `npm ci --include=dev --no-audit` from the repo root.
2. Run `npm run build:app`.
3. Run `npm run build:portal`.
4. Run `npm run build:website`.
5. Smoke-test route entrypoints on each deployed surface.
