# Unified Assessment Reference — Comparison with VendorSoluce Taxonomy

**Reference location:** `C:\Users\facel\Downloads\tools\unified-assessment`  
**Purpose:** Compare the ERMITS Unified Cyber Exposure Assessment’s **data types** and **critical operations & assets** to existing taxonomies. The unified-assessment tool is **reference only** — not used in products.

**Related:** For **CyberCaution Toolkits — Security Posture (Cascade)**, see `cybercaution-monorepo/packages/toolkits/docs/UNIFIED-ASSESSMENT-REFERENCE-FOR-CASCADE.md`.

---

## What the unified-assessment tool contains

- **Single intake** → organization context, **critical operations & assets**, vendor ecosystem, security readiness, privacy posture.
- **Four scoring engines:** Ransomware readiness, operational posture, vendor threat exposure, privacy/regulatory exposure.
- **Data files (reference):**
  - `data/data-types.js` — data type taxonomy
  - `data/assets.js` — asset categories, critical business functions, critical systems
  - `data/vendor-types.js`, `data/sectors.js`, `data/roles.js`

---

## Data types comparison

| Unified assessment (`data-types.js`) | VendorSoluce (Radar / riskCalculations) |
|--------------------------------------|----------------------------------------|
| Customer PII                         | **PII**                                 |
| Employee PII                         | **PII**                                 |
| Financial records                    | **Financial**                           |
| Health data / PHI                    | **PHI**                                 |
| Credentials / authentication data    | **Confidential** (or IP)                |
| Vendor data                          | **Confidential**                        |
| Legal records                        | **Confidential**                        |
| Payment data                         | **Financial**                           |
| Telemetry / logs                     | **Confidential** or Public              |
| IP / confidential business data      | **IP**, **Confidential**                |

**VendorSoluce taxonomy (canonical in product):** `PII`, `PHI`, `Financial`, `IP`, `Confidential`, `Public`  
— Used in `packages/app/src/utils/riskCalculations.ts` (`DATA_RISK_WEIGHTS`), `vendorRadar.ts`, OnboardingWizard, CSV import/export.

**Result:** The unified-assessment list is **more granular** (10 labels) but maps cleanly onto the existing six types. No new product data-type values are required; the existing taxonomy already covers the same semantic space.

---

## Critical operations & assets (unified-assessment only)

VendorSoluce does **not** currently have “critical operations” or “asset categories” in the Radar or assessment flow. The unified-assessment tool does:

- **Asset categories:** Business systems, Data repositories, Infrastructure/platform, Third-party services, Communications, Identity/security tooling.
- **Critical business functions:** Identity/access, Customer operations, Finance/billing, HR/payroll, Legal/compliance, Product/service delivery, Vendor onboarding/procurement, Communications, Data analytics, Other.
- **Critical systems:** IAM/SSO, CRM, ERP, Cloud file storage, Endpoint/device fleet, Email/collaboration, Payment systems, Ticketing/support, Backup/recovery, SIEM/logging, Custom apps, Other.

**Useful for:** Future product ideas (e.g. “critical operations in scope” or asset-based exposure in reports). Not implemented in VendorSoluce today.

---

## What was useful from the unified-assessment file

1. **Validation** — Confirmed that VendorSoluce’s six data types (PII, PHI, Financial, IP, Confidential, Public) are sufficient; the unified-assessment’s 10 data-type labels collapse into these without gaps.
2. **No product change** — Decision: keep the existing taxonomy; do **not** add the unified-assessment data-types or IDs into the app/website.
3. **Ideas for later** — Critical operations, asset categories, and critical systems in the unified-assessment are a useful **reference** if we later add “operations in scope” or asset-based exposure to assessments or reports.

---

## Summary

- **Data types:** Unified-assessment is reference-only. Existing VendorSoluce taxonomy remains the source of truth.
- **Critical operations & assets:** Informational only; not used in the product today but available as a reference for future features.
