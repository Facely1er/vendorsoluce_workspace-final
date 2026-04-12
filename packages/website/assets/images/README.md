# Homepage Images

## Hero Background

| Filename | Used in | Requirements |
|----------|---------|--------------|
| `vendor-risk-network.png` | Hero section CSS mask overlay | Transparent background, PNG with alpha, >2000px on longest side |

The hero image is applied as a CSS mask, allowing it to be recolored per theme (light/dark):
```css
mask: url('./assets/images/vendor-risk-network.png') center / contain no-repeat;
```

---

## Solution Workflow Cards (`#solution`)

The three workflow cards use a **Radar → Exposure → Dependency** flow. **`index.html` loads these files by name** — keep these filenames when updating screenshots:

| Card | Flow stage | Filename (exact) | Alt text |
|------|-----------|-------------------|----------|
| 1 — Map vendor inherent risk          | **Inherent risk** | `vs-inherent-risk.png` | Inherent risk scoring — five-domain weighted assessment with score summary and tier |
| 2 — Assess supply chain readiness     | **Portfolio summary** | `vs-executive-summary.png` | Executive summary — portfolio snapshot, risk distribution, and vendor risk register |
| 3 — Evidence-backed due diligence     | **Due diligence** | `vs-due-diligence.png` | Due diligence recommendation — assessment depth tiers from enhanced to lightweight with control counts |

**Capture guidance:**
- **Card 1:** Inherent risk scoring UI (five domains, weighted bars, tier / overrides if shown).
- **Card 2:** Executive summary / portfolio dashboard (KPIs, distribution, register teaser).
- **Card 3:** Due diligence recommendation step (tier cards, Standard+, evidence tags).

**Technical:**
- Browser width: 1280–1920px, crop to main content area
- Aspect ratio: 16:9 or 4:3 (standard, not ultra-wide)
- Format: JPG or PNG; optimize for web (target under ~400KB each when possible)
- Cards use `aspect-video` with `object-contain` so full UI stays visible without harsh cropping

If a screenshot file is missing, the image element is hidden automatically via `onerror` — the card still renders with text and CTA intact.
