# Legal Review Package — Consumer Legal Alignment & Gap Analysis

**Purpose:** Support **legal department review** of public-facing legal documents, their alignment with **product implementation and marketing**, and **recent documentation changes** across ERMITS product surfaces.

**Audience:** Legal counsel, compliance, product, and engineering leads.

**Scope:** Static website legal HTML, checkout-adjacent policy posture, and known implementation/marketing touchpoints as reflected in the repositories listed below.

**Important:** This document is a **technical and organizational gap analysis** prepared from source repositories. It **does not constitute legal advice**. Counsel should validate substance, applicable jurisdictions, and regulatory requirements (including FTC, state consumer, PCI-adjacent disclosures, and international rules where relevant).

---

## 1. Repository & path index

| Product / brand | Monorepo (path) | Consumer legal HTML (relative) |
|-----------------|-----------------|--------------------------------|
| VendorSoluce | `vendorsoluce-monorepo` | `packages/website/legal/` |
| VendorSoluce (app) | `vendorsoluce-monorepo` | `packages/app/` (links to marketing legal URLs; in-app billing/checkout) |
| TechnoSoluce | `technoSoluce-monorepo` | `website/legal/` |
| CyberCorrect | `cybercorrect-privacy-workspace` | `website/legal/` |
| CyberCaution | `cybercaution-risk-workspace` | `packages/website/legal/` |
| CyberSoluce | `cybersoluce-monorepo` | `packages/website/legal/` |

**Additional internal sources (not necessarily consumer-facing):**

- `cybercaution-risk-workspace/packages/base/src/content/policies/` — markdown policy sources; risk of **drift** vs. published `website/legal/*.html`.
- `vendorsoluce-monorepo/packages/app/public/policies/` — app-hosted policy materials where present (verify live URLs).

---

## 2. Document inventory by product

### 2.1 VendorSoluce (`packages/website/legal/`)

| File | Role |
|------|------|
| `terms.html` | Master-style Terms of Service |
| `privacy-policy.html` | Privacy Policy |
| `cookie-policy.html` | Cookie Policy |
| `acceptable-use-policy.html` | Acceptable Use Policy |
| `index.html` | Legal hub |

**Not present as standalone HTML in this folder:** `e-commerce-policies.html`, `subscription-payment-terms.html`, `refund-cancellation.html` (group may host full text at **checkout** or reuse another property’s artifacts — **legal to confirm**).

### 2.2 TechnoSoluce (`website/legal/`)

| File | Role |
|------|------|
| `terms.html` | Terms of Service |
| `privacy.html` | Privacy Policy |
| `cookie.html` | Cookie Policy |
| `acceptable-use.html` | Acceptable Use Policy |
| `e-commerce-policies.html` | Consolidated subscription + refund (intended for **checkout** / deep link, **not** footer) |
| `subscription-payment-terms.html` | Subscription & payment detail |
| `refund-cancellation.html` | Refund & cancellation detail |

Shared footer: `website/includes/footer.html` — **Legal section intentionally excludes** e-commerce policy links (per product policy).

### 2.3 CyberCorrect (`website/legal/`)

Same **five-file** pattern as VendorSoluce website: `terms.html`, `privacy-policy.html`, `cookie-policy.html`, `acceptable-use-policy.html`, `index.html`.

### 2.4 CyberCaution (`packages/website/legal/`)

| File | Role |
|------|------|
| `terms-of-service.html` | Terms (filename differs from `terms.html` on other properties) |
| `privacy-policy.html` | Privacy Policy |
| `cookie-policy.html` | Cookie Policy |
| `acceptable-use-policy.html` | Acceptable Use Policy |
| `index.html` | Legal hub |

### 2.5 CyberSoluce (`packages/website/legal/`)

Same five-file pattern as VendorSoluce: `terms.html`, `privacy-policy.html`, `cookie-policy.html`, `acceptable-use-policy.html`, `index.html`.

**Note:** CyberSoluce `terms.html` uses a **shorter, product-specific** structure (e.g. “Payment Terms” as **Section 7**, not the full ERMITS Master Terms numbering used elsewhere).

---

## 3. Recent engineering changes (Terms — payment / refund alignment)

The following was implemented to align **Terms** with the policy that **full** subscription, payment, and refund terms are shown **at checkout** (and in-app billing where applicable), while the **marketing site footer legal block** remains unchanged (no e-commerce links added there).

### 3.1 What changed (substantive)

1. **Section 12.1 (Pricing and billing)** — The bullet on non-refundable fees now references the **Refund & Cancellation Policy** via an **in-document anchor** to a new summary section (not a missing standalone page on properties that do not host one).
2. **New Section 12.5 — “Refund & Cancellation (Summary)”** — Short summary of cancellation, no blanket money-back, digital purchases, subscriptions, and free trials; states that the **complete** Refund & Cancellation Policy and Subscription & Payment Terms are presented in the **checkout flow** (and billing confirmation where applicable) and that **checkout controls** if anything differs.
3. **TechnoSoluce `terms.html`** — The prior sentence linking directly to `e-commerce-policies.html` from the main Terms was **replaced** by the §12.5 pattern (full detail at checkout). The standalone HTML files (`e-commerce-policies.html`, etc.) **remain** for checkout/deep-link use.

### 3.2 Files modified (for counsel / paralegal traceability)

| Repo | File |
|------|------|
| `vendorsoluce-monorepo` | `packages/website/legal/terms.html` |
| `vendorsoluce-monorepo` | `packages/website/radar/vendor-threat-radar.html` (footer Terms link normalized to `../legal/terms.html` for subdirectory deployment) |
| `cybercorrect-privacy-workspace` | `website/legal/terms.html` (also: Acceptable Use cross-link in body to `acceptable-use-policy.html`) |
| `cybercaution-risk-workspace` | `packages/website/legal/terms-of-service.html` (Table of Contents entry for §12.5) |
| `technoSoluce-monorepo` | `website/legal/terms.html` |

### 3.3 Explicit exclusion from this change

- **`cybersoluce-monorepo`** — `packages/website/legal/terms.html` was **not** updated to the §12.5 / checkout-supersession pattern; it retains a shorter §7 Payment Terms block. **Legal should decide** whether CyberSoluce should be harmonized with the group approach.

---

## 4. Executive matrix — product vs. legal corpus vs. change status

| Product / surface | Legal HTML location | Docs present | §12.5 + checkout language in Terms? | Primary cross-cutting gaps |
|-------------------|---------------------|--------------|--------------------------------------|----------------------------|
| **VendorSoluce** (website) | `vendorsoluce-monorepo/packages/website/legal/` | Terms, Privacy, Cookie, AUP | **Yes** | Trial / no credit card vs. “auto convert” and when payment method is collected; **self-hosted license (no Stripe)** SKU in app vs. Stripe-centric Terms; feature comparison table vs. fair-use / “unlimited” disclaimers |
| **VendorSoluce** (app) | Links to site legal; in-app billing | As above + app flows | **Yes** (if Terms URL is site) | **License / on-prem** offering needs explicit contract or Terms carve-out |
| **TechnoSoluce** | `technoSoluce-monorepo/website/legal/` | Terms + full e-commerce HTML pack | **Yes** | Terms mention **Stripe + Gumroad**, **lifetime** digital access — must match **actual** SKUs; confirm **checkout** displays full policies consistent with §12.5 |
| **CyberCorrect** | `cybercorrect-privacy-workspace/website/legal/` | Terms, Privacy, Cookie, AUP | **Yes** | Master Terms breadth vs. **local / browser-first** marketing; multi-brand Privacy “services” list vs. what this **domain** actually offers |
| **CyberCaution** | `cybercaution-risk-workspace/packages/website/legal/` | Terms-of-service, Privacy, Cookie, AUP | **Yes** | Same master-breadth vs. product positioning; **pricing** copy vs. live checkout |
| **CyberSoluce** | `cybersoluce-monorepo/packages/website/legal/` | Terms, Privacy, Cookie, AUP | **No** (short §7 Payment only) | **Out of sync** with group Terms approach: no §12.5, no checkout supersession clause in that document, minimal processor/refund architecture |

---

## 5. Document-by-document gap analysis (for review)

### 5.1 VendorSoluce

| Document | Path (under repo) | Material claims / topics | Implementation / marketing reality | Gap or risk | Suggested legal focus |
|----------|-------------------|---------------------------|--------------------------------------|-------------|------------------------|
| Terms of Service | `packages/website/legal/terms.html` | Stripe; subscriptions; trials; §12.5; master disclaimers | App: Stripe, **14-day trial**, marketing **no CC**; app pricing describes **downloadable / license-key / no Stripe** tier; website pricing disclaimers mention **auto-convert** and **payment method may be required after trial** | **Trial narrative** coherence; **license SKU** not clearly governed by same §12 payment rules | Harmonize trial + billing; add schedule or carve-out for self-hosted license |
| Privacy Policy | `packages/website/legal/privacy-policy.html` | Processing, subprocessors, analytics | Supabase, app analytics, third-party data (see also Terms) | Confirm **subprocessor list** and purposes match production | Data map review |
| Cookie Policy | `packages/website/legal/cookie-policy.html` | Cookies / similar tech | GA on site; app cookies | Match actual tags and consent approach | Cookie banner / consent if EU/UK |
| Acceptable Use | `packages/website/legal/acceptable-use-policy.html` | Prohibited conduct; may state strict “no refund” style lines | Enforcement via account controls | **Tone vs. Terms §12.5** (refund exceptions) | Align language so sanctions ≠ commercial refund policy confusion |

### 5.2 TechnoSoluce

| Document | Path | Material claims | Reality / notes | Gap or risk | Suggested legal focus |
|----------|------|-----------------|-----------------|-------------|------------------------|
| Terms | `website/legal/terms.html` | Stripe **+ Gumroad**; digital products; **lifetime access**; §12.5; SocialCaution freemium block | Static **pricing + Stripe**; `trial.html` links **subscription-payment-terms** | Channel SKU accuracy; **§12.5** requires checkout to show full text | Audit SKUs; verify Stripe/checkout copy |
| E-Commerce Policies | `website/legal/e-commerce-policies.html` | Full subscription + refund sections | Checkout / deep link | Must not contradict §12.5 or checkout | Version control with checkout |
| Subscription & Payment Terms | `website/legal/subscription-payment-terms.html` | Billing, trials (e.g. 14 days in doc) | Marketing **14-day trial** | Align **CC requirement** and trial end behavior | Single source of truth |
| Refund & Cancellation | `website/legal/refund-cancellation.html` | Full refund rules | Should mirror §12.5 summary | **Drift** if updated independently | Change control |
| Privacy / Cookie / AUP | `privacy.html`, `cookie.html`, `acceptable-use.html` | Standard | App + site | Multi-brand listing | Scope per property |
| Footer | `website/includes/footer.html` | No e-commerce links | Intentional | None if checkout adequate | Confirm marketing sufficiency |

### 5.3 CyberCorrect

| Document | Path | Material claims | Reality / notes | Gap or risk | Suggested legal focus |
|----------|------|-----------------|-----------------|-------------|------------------------|
| Terms | `website/legal/terms.html` | Master payment §12; §12.5; Stripe | **Local / browser** emphasis on site; pricing page exists | Master terms may **over-describe** vs. typical local-only use | **Scope**: which services on this domain |
| Privacy | `website/legal/privacy-policy.html` | Broad ERMITS service list | CyberCorrect-specific tools | **List precision** | Narrow or annex per product |
| Cookie / AUP | `website/legal/*` | Standard | Static + tools | AUP vs refund wording | Internal consistency |

### 5.4 CyberCaution

| Document | Path | Material claims | Reality / notes | Gap or risk | Suggested legal focus |
|----------|------|-----------------|-----------------|-------------|------------------------|
| Terms of Service | `packages/website/legal/terms-of-service.html` | §12 payment; **§12.5** in TOC + body | Pricing, toolkits, workspace | Checkout must match §12.5 | Verify live commerce UX |
| Privacy | `packages/website/legal/privacy-policy.html` | Full group + product blocks | Risk workspace | Same list precision | Scoping |
| Internal markdown policies | `packages/base/src/content/policies/*.md` | Long-form | Not identical to `website/legal` | **Drift** | Governance: canonical source |

### 5.5 CyberSoluce

| Document | Path | Material claims | Reality / notes | Gap or risk | Suggested legal focus |
|----------|------|-----------------|-----------------|-------------|------------------------|
| Terms | `packages/website/legal/terms.html` | **§7 Payment**: advance billing, non-refundable unless stated, 30-day price notice, taxes; **no** Stripe named in excerpt; **no** §12.5; contact **legal@cybersoluce.com** | Product may or may not sell online | **Not aligned** with group §12.5 / checkout supersession approach | Either **update** to group standard or **document** intentional lighter Terms + add processor/refund detail if selling |
| Privacy / Cookie / AUP | `packages/website/legal/` | Standard | — | Compare to live data flows | Subprocessors |

---

## 6. Operational checklist (legal + product)

Use this to confirm **behavior** matches **documents**.

| # | Question | Owner hint |
|---|----------|------------|
| 1 | Does **every** paid path (Stripe Payment Link, in-app checkout, invoice) show the **full** Refund & Cancellation + Subscription/Payment terms **before** payment, consistent with §12.5? | Product + Eng + Legal |
| 2 | For **VendorSoluce**, is the **14-day trial** behavior identical across: app UI, website FAQ/pricing, email templates, and Terms §12.4? When is the **first** charge possible? | Product + Marketing + Legal |
| 3 | For **license / self-hosted** VendorSoluce SKU, is there a **written** agreement or Terms section that governs license keys, updates, and support? | Legal |
| 4 | Do **TechnoSoluce** sales still use **Gumroad** and **lifetime** digital access as stated in Terms? If not, update Terms. | Legal + Product |
| 5 | Are **Privacy Policies** scoped so each **domain** does not imply collection/use for brands or services not offered there? | Legal |
| 6 | Is there a **single canonical** policy version for checkout (and a process to update §12.5 summaries when checkout text changes)? | Legal + Eng |

---

## 7. Known secondary surfaces (lower priority)

| Surface | Repo path | Note |
|---------|-----------|------|
| TechnoSoluce campaigns | `technoSoluce-monorepo/campaigns/` | Demo pages; mix of absolute `technosoluce.com` and relative `/legal/` links — hygiene for non-production hosts |
| VendorSoluce radar | `packages/website/radar/` | Legal links in footers/nav should use paths valid for subdirectory deploy |

---

## 8. Revision log (this package)

| Date | Author | Change |
|------|--------|--------|
| 2026-03-20 | Engineering (repo) | Initial `LEGAL_REVIEW_PACKAGE_CONSUMER_LEGAL_ALIGNMENT.md` created: inventories, gap tables, §12.5 change log, operational checklist |

---

## 9. Copying this package to other monorepos

This file lives under **VendorSoluce** for convenience. Sibling repos (`technoSoluce-monorepo`, `cybercorrect-privacy-workspace`, `cybercaution-risk-workspace`, `cybersoluce-monorepo`) may add a **short pointer** `docs/LEGAL_REVIEW_SEE_VENDORSOLUCE.md` linking to this path, or duplicate this document — **legal should prefer a single canonical copy** to avoid divergence.

**Suggested canonical path:**  
`vendorsoluce-monorepo/docs/LEGAL_REVIEW_PACKAGE_CONSUMER_LEGAL_ALIGNMENT.md`
