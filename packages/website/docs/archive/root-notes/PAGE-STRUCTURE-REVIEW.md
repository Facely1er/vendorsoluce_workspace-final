# Page Structure Review: CyberCaution → VendorSoluce

## Summary

This document compares CyberCaution’s Homepage and How It Works structure with VendorSoluce and recommends alignments for **UI/UX**, **value proposition**, and **customer journey**.

---

## CyberCaution Structure

### Homepage flow
1. **Hero** – Headline, subtext, 5 check bullets, **4 metric cards** (frameworks, sectors, $0 tier, ~15 min).
2. **Action (primary CTA)** – “Understand your risk posture” + View Pricing + Download desktop app.
3. **Solution** – “Three steps to threat readiness” (Discover → Assess → Close) with **“See How It Works”** button.
4. **Problem** – “Readiness fails when it matters most” (4 pain cards).
5. **Action Cascade** – “Need more visibility?” (Define Your Risk Posture).
6. **Footer**

### How It Works
- **Breadcrumb**: Home → How It Works.
- **Intro**: “Three stages. Three outcomes. One journey to threat readiness.”
- **Stage 1** – Discover Threat Exposure (outcome, bullets, sector carousel, links to Threat Radar / Industry Threat Intel).
- **Stage 2** – Understand Readiness Gaps (outcome, bullets, CTA).
- **Stage 3** – Close the Gaps (outcome, bullets, sub-cards, Defense toolkits, CTA).
- **Collapsibles**: “How CyberCaution evaluates…” and “Threat context, not theoretical risk.”
- **Footer**

### Customer journey (CyberCaution)
- **Hook** (hero + metrics) → **Act** (primary CTA) → **Explain** (3 steps + How It Works) → **Pain** (problem) → **Act again** (secondary CTA).

---

## VendorSoluce (before changes)

### Homepage flow
1. Hero  
2. Metrics (4 cards)  
3. Problem (“The cost of not knowing”)  
4. Outcomes (Value Journey – 3 steps)  
5. Solution (3-stage lifecycle)  
6. Features (core capabilities)  
7. Packages (value-based)  
8. Three Distinct Processes  
9. Benefits (business benefits + table)  
10. Action (final CTA)  
11. Footer  

### Gaps vs CyberCaution
- No **early CTA** after metrics (first CTA is deep in Problem).
- **3-step “solution”** appears after Problem; CyberCaution shows solution (3 steps) and “See How It Works” *before* Problem.
- “See How It Works” is not prominent on the homepage (only in nav).
- How It Works page exists and has breadcrumb + stages; structure is already aligned in spirit.

---

## Adaptations applied

1. **Early CTA section** – Inserted after Metrics: “Make defensible vendor decisions — before risk becomes a breach” with **View Pricing** and **See How It Works** to mirror CyberCaution’s first CTA.
2. **Three Distinct Processes** – “See How It Works” link added at the bottom so the 3-step story drives traffic to the How It Works page.
3. **Hero CTAs** – Left as-is (#value, #process); optional later: point one hero button to `how-it-works.html` or `#three-processes` for consistency.
4. **How It Works page** – Already has breadcrumb, intro, staged content, and outcome-focused copy; no structural change required for this review.

---

## Recommended future tweaks (optional)

- **Reorder sections**: Move “Three Distinct Processes” (or a single “Three steps” solution block) to sit **after** the early CTA and **before** Problem, so the journey matches CyberCaution: Hero → Metrics → CTA → 3 steps (+ See How It Works) → Problem → … .
- **Nav**: Keep Home, How It Works, Features, Pricing, Trust, FAQ (already aligned).
- **How It Works**: Consider adding one short collapsible “How VendorSoluce evaluates vendor risk” for trust and depth, similar to CyberCaution’s methodology section.

---

## Features page vs homepage coherence

### CyberCaution

| Aspect | Homepage | Features page | Coherent? |
|--------|----------|---------------|-----------|
| **Value prop** | Ransomware readiness, threat context, “Build readiness now” | “Features & Capabilities” — “Ransomware readiness assessments, threat intelligence, and remediation guidance” | Yes |
| **Primary links** | How It Works, Threat Radar (in solution/CTA) | Intro links: How it works, Threat Radar | Yes |
| **Metrics** | 8+ frameworks, 8 sectors, $0 tier, ~15 min | Sector-specific assessment (8 sectors: Healthcare, Financial, Manufacturing, Education, Government, Energy, Legal, Retail); Framework alignment (NIST CSF, HIPAA, PCI-DSS, ISO 27001) | Yes — features expand homepage metrics |
| **Structure** | 3 steps (Discover → Assess → Close) | Features page does not repeat the 3 steps; it details sectors, frameworks, and 7 Security Domains | Yes — complementary |

**Conclusion:** CyberCaution’s Features page is coherent with the homepage. Intro echoes value prop; sectors and frameworks match homepage metrics; 7 Security Domains add depth without contradicting the 3-step story.

---

### VendorSoluce

| Aspect | Homepage | Features page | Coherent? |
|--------|----------|---------------|-----------|
| **Value prop** | “Make defensible vendor decisions — before risk becomes a breach”; “prioritized decisions, evidence-backed approvals, continuous oversight” | “Platform Features & Capabilities” — “comprehensive vendor governance and supply chain risk management… NIST SP 800-161” | Partially — intro could explicitly echo “defensible decisions” and “evidence-backed” |
| **Primary links** | #value, #process, features.html (“See all features”) | Intro links: how-it-works.html, Vendor Threat Radar | Yes |
| **Core capabilities** | 3 cards: Vendor Intake Portal, Evidence Vault, Control Mapping | Same 3 in “Core capabilities” section, plus Risk Scoring and others | Yes — features page repeats then expands |
| **Process story** | Radar → Assessment → Due Diligence (3 distinct processes) | Stakeholder tabs (Security, Procurement, Compliance, Executives) with SBOM, Vendor Risk Calculator, NIST 800-161, etc. | Yes — features page adds detail by role and tool |
| **Meta/OG** | — | “SBOM analysis, vendor risk calculators, compliance scoring” | Minor gap — homepage does not mention SBOM or “calculator” in the 3 core cards; acceptable as expansion on features page |

**Conclusion:** VendorSoluce’s Features page is largely coherent. The only improvement is to tie the features intro sentence to the homepage value prop (defensible decisions, evidence-backed approvals) so the narrative is consistent. Core capabilities match; stakeholder section and extra capabilities (SBOM, Risk Calculator, etc.) appropriately expand the story.

---

### Recommendations applied

- **VendorSoluce features.html**: Intro paragraph updated to reference “defensible vendor decisions” and “evidence-backed approvals” so it aligns with the homepage hero and value proposition.
