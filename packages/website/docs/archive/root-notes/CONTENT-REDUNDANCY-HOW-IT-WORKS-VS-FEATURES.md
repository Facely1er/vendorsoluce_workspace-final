# Content Redundancy: How It Works vs Features

This document summarizes overlap between **How it Works** (`how-it-works.html`) and **Features** (`features.html`) so you can trim duplication and keep each page focused.

---

## 1. Page roles (intended)

| Page | Role |
|------|------|
| **How it Works** | Journey and process: *why* and *in what order* (three stages, value delivered, business questions, workflow steps). |
| **Features** | Capability catalog: *what* the platform does (by stakeholder, by category, tools and modules). |

Some overlap is intentional (e.g. both mention NIST, Evidence Vault). The goal is to avoid saying the same thing in the same way in both places.

---

## 2. Redundancies

### 2.1 NIST SP 800-161 / NIST alignment

- **How it Works:** Hero meta, Value Journey card 2 (“Risk-aligned requirements (NIST SP 800-161 directionally)”), Process 2 (requirements matrix, gap analysis, risk-proportionate tiers).
- **Features:** Hero (“aligned with NIST SP 800-161”), Core features intro, Supply Chain Risk Assessment, NIST Checklist Tool, NIST Compliance Scoring, Compliance Officer NIST 800-161 card.

**Suggestion:** Keep NIST in both as a trust signal. In **Features**, shorten one of the NIST paragraphs (e.g. Supply Chain Risk Assessment or NIST Checklist) and link to How it Works for “how we apply NIST” instead of re-explaining.

---

### 2.2 Evidence Vault / evidence & document management

- **How it Works:** Process 3 “Evidence Vault” — business question, Vendor Self-Service Portal Workflow (3 steps), Portal Features list, Completion Rate table.
- **Features:** Core feature “Evidence Vault” (centralize documents, attestations, proof, versioning, linking to decisions); Vendor Management “Evidence & document management” (same value prop + link to Core features); Vendor Assurance Portal (self-service).

**Suggestion:** Keep Process 3 on How it Works as the *workflow* (invitations → vendor completion → review). On **Features**, keep one short Evidence Vault definition (e.g. Core only) and have “Evidence & document management” and “Vendor Assurance Portal” reference that and/or link to How it Works (“See how evidence collection works”) instead of re-describing the same idea.

---

### 2.3 Risk Radar / Vendor Risk Radar / Vendor Threat Radar

- **How it Works:** “Risk Radar” in Value Journey (card 1) and “Process 1: Vendor Radar & Discovery” (What Happens, Risk Score Factors).
- **Features:** “Vendor Risk Radar” (Visualization & Scoring — radar charts, multi-dimensional); hero link to “Vendor Threat Radar”.

**Issues:** Three names for related things (Risk Radar, Vendor Risk Radar, Vendor Threat Radar). Same product: prioritization, risk scoring, visualization.

**Suggestion:** Pick one product name (e.g. “Vendor Threat Radar”) and use it consistently; use the other only as a short synonym if needed. On **Features**, keep the Visualization card short (e.g. “Interactive risk visualization — see [How it Works](#) for the full process”) to avoid re-telling the same story.

---

### 2.4 Assessments (NIST-aligned, gap analysis, risk-based)

- **How it Works:** Value Journey card 2 “Assessment → Confidence”; Process 2 NIST 800-161 (requirements, gap analysis, risk-proportionate Critical/High/Medium/Low).
- **Features:** Supply Chain Risk Assessment (NIST 800-161, risk scoring), NIST Checklist Tool, Vendor Security Assessments (CMMC, NIST Privacy), Compliance Officer “NIST SP 800-161 Compliance Assessment”.

**Suggestion:** How it Works = *how* assessments fit the journey and how risk-proportionate assessment works. Features = *what* tools exist (Supply Chain Assessment, NIST Checklist, etc.). Reduce repeated phrases like “NIST 800-161 aligned” in Features to one clear mention and “NIST-aligned” elsewhere; link to How it Works for process detail.

---

### 2.5 Defensible decisions / evidence-backed / audit-ready

- **How it Works:** Intro “evidence-based proof”, Value Journey card 3 “Evidence-backed decisions”, “audit-ready decisions with living oversight”.
- **Features:** Hero “defensible vendor decisions and evidence-backed approvals”, Evidence Vault “linking to decisions”, Executive Reporting “audit-ready reports”.

**Suggestion:** Keep the message on both pages; tighten **Features** hero to one short line and avoid repeating the exact phrase “evidence-backed” and “defensible” in multiple sections.

---

### 2.6 Risk scoring and prioritization

- **How it Works:** Risk Radar (exposure-based prioritization, risk drivers), Process 1 (risk profiling, real-time risk scoring).
- **Features:** Core “Risk Scoring”, Supply Chain Risk Assessment “real-time risk scoring”, Vendor Risk Calculator, NIST Compliance Scoring.

**Suggestion:** How it Works owns the *narrative* (prioritization, scoring in the journey). Features should list *where* scoring appears (Radar, Assessment, Calculator, NIST) without re-explaining “prioritize by risk” in full each time.

---

### 2.7 Vendor self-service / portal workflow

- **How it Works:** Process 3 “Vendor Self-Service Portal Workflow” (invitations, vendor completion, review/approval).
- **Features:** “Vendor Assurance Portal” (self-service assessments, reduce burden, collect vendor risk info).

**Suggestion:** Treat How it Works as the single place that describes the 3-step workflow. In Features, one short “Vendor Assurance Portal” blurb that points to How it Works for the workflow (“See Process 3: Evidence Vault”).

---

### 2.8 Remediation

- **How it Works:** Value Journey “Gap clarity that drives remediation planning”; Process 2 gap analysis.
- **Features:** Core “Remediation Tracking”; NIST Checklist “remediation guidance”; NIST Compliance Scoring “prioritize remediation”.

**Suggestion:** Fine to mention remediation on both. Avoid repeating “gap clarity that drives remediation” verbatim on Features; use “Remediation Tracking” and “prioritize remediation” as capability labels and link to How it Works for the flow.

---

### 2.9 Get Started CTA

- **Both:** A “Get Started” block (14-day trial, Start Free Trial). Already reduced on Features.

**Suggestion:** Keep one CTA per page; no change needed unless you want different primary actions per page.

---

## 3. Naming consistency

| Concept | How it Works | Features | Recommendation |
|--------|----------------|----------|-----------------|
| Radar product | Risk Radar, Vendor Radar & Discovery | Vendor Risk Radar, Vendor Threat Radar | Use one canonical name (e.g. Vendor Threat Radar) everywhere. |
| Evidence collection | Process 3: Evidence Vault, Vendor Self-Service Portal Workflow | Evidence Vault, Evidence & document management, Vendor Assurance Portal | Keep “Evidence Vault” for the capability; use “Vendor Assurance Portal” or “Self-Service Portal” for the workflow and align wording with How it Works. |

---

## 4. Quick wins

1. **Features – Hero:** Shorten to one sentence and “Learn how it works” / “Explore Vendor Threat Radar” links.
2. **Features – Evidence:** Keep Core “Evidence Vault” definition; in “Evidence & document management” and “Vendor Assurance Portal”, add “See [How it Works](how-it-works.html#evidence-portal-detail) for the workflow.”
3. **Features – Vendor Risk Radar:** One line: “Interactive risk visualization and prioritization. See [How it Works](how-it-works.html#vendor-radar-detail) for the process.”
4. **Features – NIST:** Use “NIST-aligned” or “NIST SP 800-161” once in full, then “NIST-aligned” + link to How it Works for assessment process.
5. **How it Works:** Already process-focused; no major cuts needed. Optionally add a short “For a full capability list, see [Features](features.html).” near the end.

---

## 5. Summary

- **How it Works** = journey, order, and process (why and in what sequence).
- **Features** = catalog of capabilities and who they’re for (what exists).

Main redundancy: same *concepts* (Evidence Vault, NIST assessments, risk radar, self-service portal) described in full on both pages. Reduce by: (1) one clear definition per concept on Features, (2) “See How it Works” links for process/workflow, (3) single canonical name for the radar product, (4) shorter hero and fewer repeated phrases on Features.
