# LinkedIn Product Pages — Content verification and update copy

**Purpose:** Align LinkedIn Product Page fields with capabilities, pricing, and messaging reflected in the ERMITS product repositories (as of repository review, March 2026).

**Sources reviewed:**

- `cybercorrect-privacy-workspace` — `website/pricing.html`, `website/features.html`, `website/trust.html`, `README.md`
- `vendorsoluce-monorepo` — `packages/website/pricing.html`, `packages/app/src/lib/stripeProducts.ts`, `README.md`, FAQ/pricing copy
- `cybercaution-risk-workspace` — `packages/base/src/shared/config/subscriptionConfig.ts`, `README.md`, `PRODUCT_DESCRIPTION.md`, defense-workflow docs

**Disclaimer:** This document is an internal drafting aid. LinkedIn field limits, category picklists, and eligibility rules are controlled by LinkedIn; trim or split copy as required. Do not claim third-party certification or “compliance” on behalf of customers unless you have verified legal/marketing approval.

---

## 1. CyberCorrect™

### Verification summary

| Area | LinkedIn (screenshot) vs repo |
|------|-------------------------------|
| **Pricing (Standard / Professional)** | **Aligned:** $49/mo and $99/mo match `website/pricing.html` (also $147/qtr and $297/qtr). |
| **Free version** | **Mostly aligned:** Public **Privacy Review** tools on the marketing site are $0; **hosted Privacy Workspace** is paid. Say “free privacy reviews and diagnostics on the website” vs “free hosted workspace” to avoid overclaiming. |
| **Long description** | **Dense but directionally accurate.** Repo emphasizes **Privacy Operations** (RoPA/processing activities, data map, tasks, evidence, reports), **hosted workspace** at `workspace.cybercorrect.com`, plus **Workspace Local** (one-time) and **Custom** deployment. Framework references on `trust.html` include GDPR, CCPA/CPRA, FERPA, MODPA, **NIST Privacy Framework**, ISO/IEC 27701 — with explicit “not certification” disclaimer on trust pages. |
| **“20+ tools”** | Consistent with toolkit/marketing language; keep if still accurate against live product catalog. |
| **Website URL** | Prefer **`https://www.cybercorrect.com/`** (HTTPS). |
| **Internal conflict** | Root `README.md` mentions a lower offline price in places vs **`$990` one-time** for Workspace Local on `pricing.html` — **treat `pricing.html` as customer-facing canonical** unless README is updated. |

### Recommended LinkedIn category

- Keep **Data Privacy Management Software** if it matches LinkedIn’s list, or consider **GRC / compliance management**-style categories if available and you want to stress audit evidence and registers.

### Pricing overview (LinkedIn toggles)

- **Free version available:** **Yes** — for **public-site** reviews/diagnostics (not full hosted org workspace).
- Clarify in the description that the **subscription** is for the **hosted Privacy Workspace**.

### Recommended “About” text (replace / trim to fit)

CyberCorrect™ is a **privacy operations** platform from ERMITS. It helps teams build a defensible privacy program around **processing activities** and a living **Record of Processing Activities (RoPA)**, with linked **data mapping**, **risk and compliance** tracking, **gap analysis**, **DPIA** support, **tasks**, **evidence**, and **audit-oriented reporting**.

**CyberCorrect Privacy Review** on the public website offers **no-cost, browser-based** exposure and posture checks (e.g. dashboards, radars, and regulatory readiness flows). **CyberCorrect Privacy Workspace** (`workspace.cybercorrect.com`) is the **hosted** environment for ongoing program work. **Workspace Local** (offline/static deployment) and **Custom** (client-hosted, SSO, integrations) address data residency and enterprise governance.

Framework alignment is described across the product for regimes such as **GDPR**, **CCPA/CPRA**, **HIPAA**, **FERPA**, **MODPA**, and **NIST Privacy Framework** concepts; the product **does not** certify customers or guarantee regulatory outcomes.

### Plans and pricing (LinkedIn plan table)

| Plan name | Price | Notes |
|-----------|-------|--------|
| Free (Privacy Review) | Free | Public-site diagnostics; not the full hosted workspace. |
| Standard | **$49/mo** (or $147/qtr) | Hosted Privacy Workspace — per `pricing.html`. |
| Professional | **$99/mo** (or $297/qtr) | Hosted — expanded reporting/visibility per site positioning. |
| Workspace Local | **$990 one-time** | Offline/local bundle — include only if LinkedIn allows a one-time SKU. |
| Custom | Contact sales | Enterprise / client-hosted — per site. |

### Target audience (roles)

Keep current privacy-centric roles if they match your ICP; repo also calls out **Legal & Compliance**, **IT & Security**, and **Executive** stakeholders (`features.html`). Add **Legal Counsel** or **Information Governance** only if you actively sell to them.

### Feature graphic / bullets (suggested accuracy pass)

Current graphic themes (notice management, consumer rights, sharing/sale controls, third-party governance) are consistent with the privacy narrative. If you list **NIST CSF**, prefer language like **“risk-informed, control-oriented alignment”** unless you only mean **NIST Privacy Framework** on the trust page — be precise to avoid mixing CSF vs privacy framework claims.

---

## 2. VendorSoluce™

### Verification summary

| Area | LinkedIn (screenshot) vs repo |
|------|-------------------------------|
| **Plans and pricing** | **Not aligned.** LinkedIn showed **$39/mo, $129/mo, $449/mo**. Canonical public pricing in `packages/website/pricing.html` is **Starter $999 one-time** (optional **$99/yr** updates/feeds SKU), **Professional $189/mo** ($1,814/yr annual), **Enterprise $549/mo** ($5,270/yr annual), **Federal — contact sales**. |
| **Free version vs trial** | **Contradiction to fix:** Description said “free entry point” while pricing overview showed **No free version**. Repo: **no perpetual free tier** documented; **14-day free trial** (Professional-level, no credit card) appears in FAQ/app copy — **set “Free trial: Yes”** and **“Free version: No”** unless you ship a freemium SKU. |
| **Category** | **Supply Chain Management Software** is broad but acceptable; **third-party / vendor risk (SCRM)** is the accurate niche. |
| **NIST** | Lead with **NIST SP 800-161**-oriented third-party risk workflows (as README/site). **NIST CSF** appears as conceptual alignment in trust/marketing — avoid implying certification. |
| **SBOM / Tier-2** | Supported in product narrative: SBOM analysis (CycloneDX/SPDX, CVE/NVD-style language), tiered scan limits by plan in app comparison tables; **full SBOM ingestion** positioned at Professional+ in app copy. |
| **Website URL** | Use **`https://www.vendorsoluce.com`** (HTTPS). |

### Recommended “About” text

VendorSoluce™ is an integrated **third-party and supply chain risk** platform for security, procurement, and compliance teams. It helps organizations **discover and assess vendors**, score and track risk, collect **evidence**, and produce **defensible reporting** — with workflows and content **aligned to NIST SP 800-161** and related third-party risk practice.

Capabilities include **vendor assessments** and **questionnaires**, **vendor-facing portal** experiences, **vendor risk dashboards**, **Vendor Threat / Risk Radar**-style visibility, and **SBOM** analysis (CycloneDX/SPDX) with **component and vulnerability-oriented insights** (limits vary by tier). **Starter** is a **local-first** purchase; **Professional** and **Enterprise** are **managed SaaS** tiers with higher limits and enterprise deployment options; **Federal** programs are **scoped and custom**.

The product **assists** with framework-aligned work; it **does not** guarantee compliance, certification, or audit outcomes.

### Pricing overview (LinkedIn toggles)

- **Free version available:** **No** (unless product/marketing introduces one).
- **Free trial available:** **Yes** — state **14-day trial**, **full Professional access**, **no credit card** (verify live checkout before publishing).

### Plans and pricing (LinkedIn plan table) — **update required**

| Plan | Price | Billing |
|------|-------|---------|
| Starter | **$999** | **One-time** (local-first); optional **$99/yr** updates & feeds — separate SKU |
| Professional | **$189/mo** | or **$1,814/yr** (annual discount on site) |
| Enterprise | **$549/mo** | or **$5,270/yr** (annual discount on site) |
| Federal | **Contact sales** | Custom / scoped programs |

### Target audience (roles)

Current list (security, procurement, compliance, COO) **fits**. Consider adding **Vendor Manager** / **Third-Party Risk Manager** if those exist in LinkedIn’s picklist.

### Housekeeping

- Align **README.md** / `archive/PRODUCT_DESCRIPTION.md` pricing bullets with `pricing.html` so internal docs do not reintroduce old **$39 / $129 / $399** figures into campaigns.

---

## 3. CyberCaution™

### Verification summary

| Area | LinkedIn (screenshot) vs repo |
|------|-------------------------------|
| **Category: Threat Intelligence Platform** | **Partial fit.** Repo positions **ransomware readiness**, **assessments**, **defense roadmap / workflow**, **controls and evidence**, plus **threat context** (radar, feeds where configured). Prefer a category closer to **security / risk readiness** or **computer & network security** if available; use “threat intelligence” as a **keyword**, not the only label. |
| **Short description** | **Understates breadth.** Accurate pillars: **sector-aware ransomware readiness assessments**, **NIST CSF / CISA-aligned** control framing (see `RANSOMWARE_ASSESSMENT_NIST_CISA.md`), **defense workflow** (assessment → controls → evidence → reporting), **toolkits** on higher tiers, optional **backend sync** (e.g. Supabase) on paid tiers. |
| **Plans** | LinkedIn showed only **Free** and **Enterprise**. **Repo subscription config** includes **Starter Kit ($149)**, **Risk Workspace ($349)**, **Workspace Pro ($599)**, and **Enterprise (custom)** — **add the middle tiers** or summarize as “paid bundles from $149; Enterprise custom” if LinkedIn limits rows. |
| **Free tier** | **Accurate to label “free version”** with limits: **1 assessment**, **1 report preview**, limited history — no API, no JSON export, no full toolkit path (`subscriptionConfig.ts`). |
| **Threat radar** | Full **static** radar experience (profiler, PDF) is distinct from React **Threat Landscape** cards; avoid implying one single “live TI platform” if messaging is not unified everywhere. |
| **Website URL** | Use **`https://www.cybercaution.com`**. |

### Recommended “About” text

CyberCaution™ is a **ransomware-focused security readiness** platform that turns assessments and threat context into an actionable **defense roadmap**. Teams use **sector-aligned readiness assessments**, **controls-oriented gap analysis** mapped to **NIST Cybersecurity Framework** and **CISA** ransomware guidance, and structured **evidence and reporting** to support executives and auditors.

The product includes **threat radar and landscape-style views** (implementation varies by surface: full profiler/PDF radar vs in-app intelligence cards), **optional toolkits and registers** on higher tiers, **local-first usage** with optional **cloud sync** when configured, and **API and SSO-oriented options** on **Workspace Pro** and **Enterprise**.

CyberCaution **supports** readiness and documentation; it does not replace a SOC or guarantee that specific threats will not occur.

### Pricing overview (LinkedIn toggles)

- **Free version available:** **Yes** — clearly **limited** (assessment and report preview caps).
- **Free trial:** Add only if you run a time-limited trial distinct from Free; otherwise rely on **Free** row.

### Plans and pricing (LinkedIn plan table)

| Plan | Price | Notes (from `subscriptionConfig.ts`) |
|------|-------|--------------------------------------|
| Free | **Free** | Limited assessments, report preview, capped history; no toolkit/API/sync. |
| Starter Kit | **$149** | Paid tier — unlimited assessments & advanced reports in config; no in-app toolkit / JSON export / backend sync in this tier’s feature flags. |
| Risk Workspace | **$349** | Toolkit, JSON export, backend sync, advanced analytics. |
| Workspace Pro | **$599** | Adds API allowance (10k/mo in config), custom branding, auth/SSO integration flag. |
| Enterprise | **Contact sales** | Multi-user collaboration, custom assessments, compliance automation, priority support, higher limits — per product docs. |

**Note:** Some **cascade** marketing pages may show different monthly figures; **prefer `subscriptionConfig.ts` + published download/pricing pages** as canonical before locking LinkedIn numbers.

### Target audience (roles)

Existing list (CISO, security analyst/manager, IT director, admins, risk/compliance) **fits**. Consider **Business Continuity**, **IT Risk**, or **Incident Response** roles if available and aligned with sales motion.

### Three-step journey (infographic alignment)

The **Discover → Understand (readiness gaps) → Close gaps (evidence & reporting)** story on your graphic **matches** the defense-workflow narrative in-repo. Optionally add that **“Discover”** spans **assessment + threat context**, and **“Close”** includes **controls implementation and monitoring** steps in the full workflow (six phases in internal docs).

---

## 4. Cross-product checklist before submit

1. **HTTPS** on all website fields.  
2. **Prices** match **live** `pricing.html` / checkout, not old README/archive docs.  
3. **Free vs trial** toggles match actual SKUs.  
4. **Framework language:** “Aligned / assists / supports” — not “certified” or “compliant” for the customer.  
5. **LinkedIn eligibility banner** (“not eligible”) is a **platform policy** issue; fixing copy alone may not unlock submission — still worth accurate pages for future use or other channels.

---

## 5. Quick copy-paste snippets (short)

**CyberCorrect (one line):**  
Privacy operations platform: RoPA-centered workspace, mapping, tasks, evidence, and reporting — plus free public-site privacy reviews and optional local/enterprise deployment.

**VendorSoluce (one line):**  
Third-party risk platform with NIST SP 800-161–oriented assessments, vendor portal, SBOM analysis, and dashboards — Starter one-time, Professional/Enterprise SaaS, Federal custom.

**CyberCaution (one line):**  
Ransomware readiness platform: sector assessments, NIST/CISA-aligned controls and evidence workflows, threat context and reporting — from a limited free tier to paid workspace bundles and Enterprise.
