# UI/UX & Customer Journey Audit

**Scope:** vendorsoluce-monorepo (website, app, vendor-risk-portal)  
**Focus:** Issues and inconsistencies impacting UI/UX and customer journey.

---

## 1. Navigation & layout inconsistencies

### 1.1 Multiple header variants and duplicated logic

| Issue | Detail |
|-------|--------|
| **Two header systems** | Main site uses `includes/header.html` (full nav with all links). Radar uses `includes/radar-header.html` (simplified: logo + “Main Site” + theme; no Pricing, Trust, FAQ in top bar; side nav on large screens). |
| **Logo size** | Main header: `h-[3.75rem] w-[3.75rem]`. Radar header: `h-10 w-10` to `md:h-14 md:w-14` — visually different. |
| **Redundant templates** | `header-template.html` / `footer-template.html` exist alongside canonical `header.html` / `footer.html`; build only uses the latter. Unclear if templates are legacy or intentional. |
| **Mobile menu in three places** | (1) Inline script in `header.html`, (2) `assets/js/navigation.js`, (3) script inlined by `embed-header-footer.js`. Same behavior maintained in multiple places — risk of drift and harder maintenance. |
| **Active nav logic duplicated** | `setActiveNavLink` lives in both `navigation.js` and the script block in `embed-header-footer.js`. |

**Impact:** Inconsistent feel between main site and Radar; maintenance burden; possible bugs if only one place is updated.

---

### 1.2 Subsites with no shared header/footer

| Page | Issue |
|------|--------|
| **`steel/index.html`** | ERMITS-branded (og/twitter point to ermits-advisory.com), no VendorSoluce header/footer. Different product and domain from rest of site. |
| **`assessment/index.html`** | Standalone: no shared header/footer, no site nav. Only Tailwind + `styles.css`; loads via ES module. |

**Impact:** From a customer journey perspective, Steel and Assessment feel like separate products with no clear path back to VendorSoluce or to platform/portal.

---

### 1.3 Path handling for embedded header/footer

- `embed-header-footer.js` adjusts paths for subdirectories (e.g. `legal/`, `radar/`) so relative links work.
- **Radar** uses `../index.html`, `../pricing.html`, etc. in its header/side nav — correct when served from `/radar/`.
- **Legal** pages get `../`-prefixed links from the embed script.
- **Steel** and **assessment** are not in the embed list; if they ever use shared header/footer, path logic would need to be extended.

---

## 2. Customer journey & CTAs

### 2.1 No explicit “Sign In” in website nav

- **Main header:** Only “Account” (user icon) → `/account.html` (static page for local preferences, theme, quick links).
- **Account page** describes “Local Account” and “No account registration required” and does not offer a prominent “Sign In to platform” CTA.
- **Pricing** has “Get Started” → `https://www.platform.vendorsoluce.com` (correct).
- **Platform app** uses “Sign In” / “Get Started” on its own landing and pricing.

**Impact:** Users on the marketing site who want to sign in to the platform may look for “Sign In” and only find “Account,” which does not take them to the app. Primary path to platform is via Pricing “Get Started” or direct URL.

**Done:** Sign In CTA added on `account.html` (callout + link using `data-portal-path="/signin"`). Platform/portal URLs centralized (see below).

---

### 2.2 Platform URL source of truth

- **`assets/js/portal-config.js`** defines `PLATFORM_APP_BASE`, `VENDOR_PORTAL_BASE`, `VENDOR_RISK_PORTAL_BASE` (e.g. `https://www.platform.vendorsoluce.com`).
- Many HTML pages **hardcode** the same URLs in footers and CTAs (e.g. `https://www.platform.vendorsoluce.com/supply-chain-assessment`, `.../vendors`, `https://www.portal.vendorsoluce.com`).
- **Footer** (`includes/footer.html`) and multiple pages (tutorial, trust, pricing, legal/*, radar) use hardcoded platform/portal links.
- **`portal-links.js`** applies base URL only to elements with `data-portal-path`; most links do not use this attribute.

**Impact:** Changing platform/portal domain or paths requires many find-and-replace operations; risk of missed or wrong links.

**Done:** Footer and account use `data-platform-path`, `data-vendor-portal-path`, and `data-portal-path`; `portal-links.js` applies `PLATFORM_APP_BASE` / `VENDOR_RISK_PORTAL_BASE` from `portal-config.js`. Embed script injects portal-config and portal-links on pages that contain these attributes.

---

### 2.3 Account page Quick Actions

- **“Vendor Radar”** → `radar/vendor-threat-radar.html` (correct from root).
- **“Start Assessment”** → `index.html` (homepage), not the Supply Chain Assessment or assessment tool.

**Impact:** “Start Assessment” suggests starting a vendor/assessment flow but leads to the marketing homepage. Confusing for users who expect to begin an assessment.

**Recommendation:** Point “Start Assessment” to the platform Supply Chain Assessment URL (e.g. `https://www.platform.vendorsoluce.com/supply-chain-assessment`) or to `/assessment/` if the static assessment is the intended entry.

---

### 2.4 Signup vs sign-in on platform

- **App:** `/signup` redirects to `/signin`; sign-up is a mode on the sign-in page (`mode=signup`).
- Some app CTAs still use **“Sign up”** and link to `/signup` (e.g. `SBOMQuickScan.tsx`, `DashboardDemoPage.tsx`, `SupplyChainResults.tsx`), which then redirects to sign-in. Intent is consistent; wording could be “Sign in or sign up” or “Get started” to match behavior.

---

## 3. Design system & styling

### 3.1 Design tokens and brand colors

- **Website:**  
  - `assets/css/tokens.css` uses `--bg`, `--accent`, `--s-*`, `--text-*`.  
  - `account.html` and other pages use inline `:root` with `--vendorsoluce-green: #33691E` (and variants).  
  - Main Tailwind build uses `vendorsoluce-*` from config.
- **App:** `index.css` and components use `--vendorsoluce-green`, `--header-height`, risk colors, etc.
- **Steel:** Its own `:root` (e.g. `--navy`, `--navy-dark`) — different palette.
- **Radar:** Uses Tailwind + `vendor-threat-radar.css`; some inline styles remain in JS-generated HTML (e.g. report, modals).

**Impact:** Multiple definitions of “brand green” and spacing; no single token file shared by website and app. Risk of slight color/spacing differences across touchpoints.

**Recommendation:** Document canonical tokens (e.g. in `tokens.css` or shared package) and have website/app reference them; reduce duplicate `:root` blocks in HTML files.

---

### 3.2 Dark mode

- **Website:** `html.dark` / `.dark`; theme toggle in header; persisted (e.g. localStorage).
- **App:** Tailwind `dark:` and theme context.
- **Radar header:** Theme toggle present; behavior should match main site (same class and script).

No major inconsistency reported; ensure radar and any embedded pages use the same `html.dark` and persistence so theme doesn’t reset when moving between main site and radar.

---

### 3.3 Inline styles

- **Radar:** Many inline `style="..."` in JS-generated markup (vendor cards, modals, report HTML, bars). Linter already flagged one block (report-actions) and it was moved to `vendor-threat-radar.css`. Similar patterns remain (e.g. around lines 1665, 1680, 2723+, 3133+, 3462, 3592, 3643+).
- **Assessment / Steel:** Inline styles used where dynamic values (e.g. theme, risk color) are needed; acceptable if no shared component style exists.

**Recommendation:** Where possible, replace inline styles in radar with classes and CSS (or CSS variables set in JS); keep inline only for truly dynamic values (e.g. risk color, width %).

---

## 4. Accessibility & UX details

### 4.1 Account icon vs button (pricing)

- **pricing.html:** Account “button” is implemented as `<a href="/account.html"><button ... aria-label="User Account">`. A **button inside a link** is invalid HTML and can cause focus/activation issues.

**Recommendation:** Use a single `<a href="/account.html" ... aria-label="User Account">` with an icon (no nested `<button>`).

---

### 4.2 Radar account link

- **Radar:** Account link uses `href="/account.html"` and is missing `flex-shrink-0` that other pages use on the same pattern. Minor layout consistency fix.

---

### 4.3 Focus and keyboard

- Theme toggles and nav links use `focus:ring-2 focus:ring-vendorsoluce-green` — good. Ensure modal and dropdown focus trapping (e.g. radar modals) is consistent and that Escape closes overlays.

---

## 5. Cross-product branding

| Area | Observation |
|------|-------------|
| **Steel** | Branded ERMITS Advisory (ermits-advisory.com); not VendorSoluce. If Steel is part of the same “product family,” consider a shared footer or “Also from VendorSoluce” link; otherwise document that it’s a separate product. |
| **Assessment** | VendorSoluce title and description; no nav. Add at least a “Back to VendorSoluce” or footer link so the journey back is clear. |
| **Footer** | Canonical footer lists Solutions (platform, vendors, radar, portal), Resources, Legal. Radar link is relative (`/radar/vendor-threat-radar.html`). No Steel link — intentional if Steel is separate. |

---

## 6. Summary: high‑impact fixes

1. **Customer journey**  
   - Add explicit “Sign In” (to platform) in website header or account context.  
   - Fix account page “Start Assessment” so it goes to Supply Chain Assessment (or intended assessment entry), not `index.html`.

2. **Platform URLs**  
   - Centralize platform/portal base URLs (e.g. use `portal-config.js` + `data-portal-path` or build-time injection) and remove hardcoded duplicates where possible.

3. **Markup**  
   - Fix invalid “button inside link” on pricing account icon (use one `<a>` with icon).

4. **Navigation/maintainability**  
   - **Done:** Mobile menu and active-nav consolidated in `navigation.js`; inline script removed from header, embed injects `navigation.js`. Radar header logo size aligned with main; difference (simplified/side nav) documented in `radar-header.html`.

5. **Subsites**  
   - For Assessment (and optionally Steel), add a minimal “Back to VendorSoluce” or shared footer so users can return to the main site.

6. **Styles**  
   - Continue moving radar inline styles to CSS/classes; document design tokens and reduce duplicate `:root` definitions across pages.

---

## 7. Lower priority / follow-up

- Remove or document `header-template.html` / `footer-template.html`.
- Standardize CTA wording (Sign in / Sign up / Get started) across website and app.
- Add radar (and any other subsites) to embed path-adjustment logic if they ever use shared header/footer.
- Consider a single “design system” entry (e.g. storybook or doc page) for website + app components and tokens.

---

*Audit completed from codebase review. Recommend validating with real user flows (e.g. “discover product → sign in → run assessment”) and with accessibility checks (keyboard, screen reader, contrast).*
