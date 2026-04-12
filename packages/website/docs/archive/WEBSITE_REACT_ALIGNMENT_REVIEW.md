# Website & React Project Alignment Review - Customer Journey

**Date:** January 2025  
**Purpose:** Review website project alignment with React project and customer journey strategy

---

## Executive Summary

The website project (`packages/website`) has **good foundational elements** for the customer journey but needs **alignment updates** to match the React project (`packages/app`) and the outcome-driven journey strategy.

**Key Findings:**
- ✅ Demo and Trial pages exist (`demo.html`, `trial.html`)
- ✅ Basic 3-stage workflow presentation in `how-it-works.html`
- ⚠️ Missing outcome-focused messaging throughout
- ⚠️ Demo/trial pages not fully aligned with strategy docs
- ⚠️ Homepage doesn't present the 3-stage journey clearly
- ⚠️ Navigation doesn't emphasize journey progression

**Alignment Score:** 60% (Good foundation, needs messaging and flow updates)

---

## Current State Analysis

### ✅ What's Working Well

#### 1. Demo Page (`demo.html`)
- **Status:** ✅ Functional
- **Features:**
  - 4-stage interactive demo (Upload → Radar → Requirements → Results)
  - Sample vendor data pre-loaded
  - Progress indicator
  - "Try With Your Data" CTA → `trial.html`
- **Alignment:** ✅ Matches demo strategy (sample data, no email)
- **Issues:**
  - Not explicitly labeled as "Stage 1, 2, 3" of journey
  - Missing outcome statements per stage
  - Doesn't connect to React app routes

#### 2. Trial Page (`trial.html`)
- **Status:** ✅ Functional
- **Features:**
  - Zero-friction CSV upload (no email required initially)
  - Instant results display
  - Value-first email capture (floating CTA after results)
  - Privacy-first messaging
- **Alignment:** ✅ Matches zero-friction trial strategy
- **Issues:**
  - Email capture could be more prominent
  - Missing connection to React app for full experience
  - No PDF report generation mentioned

#### 3. How It Works Page (`how-it-works.html`)
- **Status:** ✅ Good structure
- **Features:**
  - 3-step workflow presentation
  - Visual cards for each stage
  - CTAs to application
- **Issues:**
  - Uses generic workflow language ("Intake, Validate, Govern")
  - Missing outcome-focused messaging
  - Not aligned with journey doc terminology

---

## Alignment Gaps

### 1. Homepage (`index.html`)

**Current State:**
- Generic feature messaging
- No clear 3-stage journey presentation
- Links to tools but not journey-focused

**Required Updates:**
- Add journey section with 3 stages
- Update hero messaging to outcome-focused
- Add CTAs: "See Demo" → `demo.html`, "Start Trial" → `trial.html`
- Present journey outcomes, not just features

**Missing Elements:**
```html
<!-- Should have: -->
<section id="journey">
  <h2>From Exposure Discovery to Risk Elimination</h2>
  <div class="journey-stages">
    <div class="stage">
      <h3>Stage 1: Discover Your Exposure</h3>
      <p>Outcome: "I know exactly which vendors pose the greatest risk"</p>
    </div>
    <!-- Stage 2, Stage 3 -->
  </div>
</section>
```

---

### 2. Demo Page Alignment

**Current:** 4-stage demo (Upload → Radar → Requirements → Results)  
**Should Be:** 3-stage journey demo (Stage 1 → Stage 2 → Stage 3)

**Required Updates:**
1. **Rename stages to match journey:**
   - Current: "Upload Vendors" → Should be: "Stage 1: Discover Your Exposure"
   - Current: "View Risk Radar" → Should be: "Stage 1 (continued)"
   - Current: "Define Requirements" → Should be: "Stage 2: Understand Your Gaps"
   - Current: "Review Results" → Should be: "Stage 3: Close the Gaps"

2. **Add outcome statements:**
   - Each stage should show: "Outcome: [specific outcome]"
   - Add business impact metrics

3. **Update CTAs:**
   - "Try With Your Data" → `trial.html` ✅ (already correct)
   - Add: "Continue to Full Platform" → React app

---

### 3. Trial Page Alignment

**Current:** Good zero-friction implementation  
**Needs:** Better connection to React app journey

**Required Updates:**
1. **After results shown:**
   - Add CTA: "Continue to Stage 2: Define Requirements" → React app
   - Link to full journey in React app

2. **Email capture modal:**
   - Mention PDF report delivery
   - Add option to "Get Full Platform Access"

3. **Results presentation:**
   - Show as "Stage 1 Complete"
   - Preview what Stage 2 and 3 offer

---

### 4. Navigation Alignment

**Current Navigation:**
- Header: "Try It Free" → `radar/vendor-risk-radar.html`
- Footer: Links to various pages

**Required Updates:**
1. **Add journey-focused navigation:**
   - "See Demo" → `demo.html`
   - "Start Trial" → `trial.html`
   - "How It Works" → `how-it-works.html` (update content)

2. **Update "Try It Free" button:**
   - Could link to `demo.html` or `trial.html` instead of radar
   - Or keep radar but add demo/trial as secondary options

---

### 5. How It Works Page Alignment

**Current:** Generic 3-step workflow  
**Should Be:** Outcome-driven 3-stage journey

**Required Updates:**

#### Current Language:
- "Vendor Exposure Radar"
- "Vendor Risk Platform"
- "Vendor Governance Portal"

#### Should Be:
- **Stage 1:** "Discover Your Exposure - I know exactly which vendors pose the greatest risk"
- **Stage 2:** "Understand Your Gaps - I know exactly what controls I need from each vendor"
- **Stage 3:** "Close the Gaps - I have evidence-based proof of vendor compliance"

**Update each section:**
1. Add outcome statement as header
2. Show business impact metrics
3. Add progression indicators ("Stage 1 of 3")
4. Link to corresponding React app pages

---

## Messaging Alignment

### Homepage Hero

**Current (Feature-Focused):**
```
"Make vendor risk decisions with evidence you can defend."
```

**Should Be (Outcome-Focused):**
```
"Discover hidden vendor exposure in hours, not months.
Define evidence-based requirements in days.
Collect proof of compliance in weeks—not months."
```

---

### Demo Page

**Current:**
```
"Experience VendorSoluce in Action"
"Walk through the complete vendor risk workflow"
```

**Should Be:**
```
"Experience the 3-Stage Journey"
"Stage 1: Discover Your Exposure → Stage 2: Understand Your Gaps → Stage 3: Close the Gaps"
```

---

### Trial Page

**Current:**
```
"Discover Your Vendor Risk in 60 Seconds"
```

**Should Be:**
```
"Stage 1: Discover Your Exposure"
"Upload your vendor list. Get instant risk radar. See which vendors pose the greatest risk."
```

---

## Cross-Project Integration

### Website → React App Flow

**Current State:**
- Website demo/trial are standalone
- No clear path to React app

**Required Flow:**
```
Website Homepage
  ↓
Demo Page (sample data)
  ↓
Trial Page (user's data)
  ↓
React App (full journey)
  ├─ Stage 1: Vendor Risk Radar (/tools/vendor-risk-radar)
  ├─ Stage 2: Supply Chain Assessment (/supply-chain-assessment)
  └─ Stage 3: Vendor Assessment Portal (/vendor-assessments)
```

**Implementation:**
1. Add CTAs in demo/trial pages → React app routes
2. Pass trial data to React app (if possible)
3. Show journey progress across both projects

---

## File-by-File Updates Required

### 1. `index.html` (Homepage)

**Updates Needed:**
- [ ] Add journey section with 3 stages
- [ ] Update hero messaging to outcome-focused
- [ ] Add CTAs: "See Demo" and "Start Trial"
- [ ] Replace feature list with outcome statements
- [ ] Add journey visualization

**Priority:** High

---

### 2. `demo.html`

**Updates Needed:**
- [ ] Rename stages to match journey (Stage 1, 2, 3)
- [ ] Add outcome statements per stage
- [ ] Update progress indicator labels
- [ ] Add business impact metrics
- [ ] Update CTAs to reference journey stages
- [ ] Add link to React app for full experience

**Priority:** High

---

### 3. `trial.html`

**Updates Needed:**
- [ ] Update header to "Stage 1: Discover Your Exposure"
- [ ] Add outcome statement
- [ ] Show results as "Stage 1 Complete"
- [ ] Add CTAs to Stage 2 (React app)
- [ ] Enhance email capture with journey context
- [ ] Mention full 3-stage journey in React app

**Priority:** High

---

### 4. `how-it-works.html`

**Updates Needed:**
- [ ] Update section headers to journey stages
- [ ] Add outcome statements per stage
- [ ] Add progression indicators
- [ ] Update descriptions to outcome-focused
- [ ] Add business impact metrics
- [ ] Link to React app pages for each stage

**Priority:** Medium

---

### 5. `features.html`

**Updates Needed:**
- [ ] Organize features by journey stage
- [ ] Add outcome context to each feature
- [ ] Show how features support journey outcomes

**Priority:** Low

---

### 6. Navigation (Header/Footer)

**Updates Needed:**
- [ ] Add "See Demo" link to header
- [ ] Add "Start Trial" link to header
- [ ] Update "Try It Free" to be journey-focused
- [ ] Add journey section links to footer

**Priority:** Medium

---

## Implementation Priority

### Phase 1: Critical (Week 1)
1. ✅ Update `demo.html` with journey stage labels
2. ✅ Update `trial.html` with Stage 1 messaging
3. ✅ Add journey section to `index.html`
4. ✅ Update homepage hero messaging

### Phase 2: High Priority (Week 2)
5. ✅ Update `how-it-works.html` with journey stages
6. ✅ Add navigation links for demo/trial
7. ✅ Add CTAs linking website → React app
8. ✅ Update all outcome messaging

### Phase 3: Medium Priority (Week 3)
9. ✅ Enhance trial page with journey context
10. ✅ Add journey progress indicators
11. ✅ Cross-project integration (website → React app)
12. ✅ Update features page organization

---

## Cross-Project Consistency

### Terminology Alignment

| Website (Current) | React App (Current) | Journey Doc (Should Be) |
|------------------|---------------------|------------------------|
| Vendor Exposure Radar | Vendor Risk Radar | Stage 1: Discover Your Exposure |
| Vendor Risk Platform | Supply Chain Assessment | Stage 2: Understand Your Gaps |
| Vendor Governance Portal | Vendor Assessment Portal | Stage 3: Close the Gaps |

**Action:** Standardize all three projects to use journey doc terminology.

---

### Route/URL Alignment

**Website Routes:**
- `/demo.html` → Demo with sample data
- `/trial.html` → Trial with user data
- `/how-it-works.html` → Journey explanation

**React App Routes:**
- `/tools/vendor-risk-radar` → Stage 1
- `/supply-chain-assessment` → Stage 2
- `/vendor-assessments` → Stage 3

**Alignment Needed:**
- Website should link to React app routes
- React app should reference website demo/trial
- Consistent journey progression across both

---

## Success Metrics

### Demo Page
- Journey stage awareness (users understand 3 stages)
- Progression to trial (demo → trial conversion)
- Progression to React app (trial → full platform)

### Trial Page
- Stage 1 completion rate
- Email capture rate (target: 75%+)
- Progression to Stage 2 (React app)

### Homepage
- Journey section engagement
- Demo/trial CTA clicks
- Journey understanding (user surveys)

---

## Quick Wins

### Immediate Updates (1-2 hours)

1. **Update demo.html stage labels:**
   ```html
   <!-- Change: -->
   <div class="step-label">Upload Vendors</div>
   <!-- To: -->
   <div class="step-label">Stage 1: Discover Your Exposure</div>
   ```

2. **Update trial.html header:**
   ```html
   <!-- Change: -->
   <h1>Discover Your Vendor Risk in 60 Seconds</h1>
   <!-- To: -->
   <h1>Stage 1: Discover Your Exposure</h1>
   <p>Outcome: I know exactly which vendors pose the greatest risk</p>
   ```

3. **Add journey section to index.html:**
   - Copy structure from `how-it-works.html`
   - Update with outcome statements
   - Add CTAs to demo/trial

---

## Conclusion

The website project has **strong foundational elements** (demo, trial, workflow pages) but needs **messaging and flow alignment** with:
1. The React project's journey implementation
2. The outcome-driven journey strategy documents
3. Consistent terminology and progression

**Estimated Implementation Time:**
- Phase 1 (Critical): 8-12 hours
- Phase 2 (High Priority): 6-8 hours
- Phase 3 (Medium Priority): 4-6 hours
- **Total: 18-26 hours**

**Next Steps:**
1. Review this document with stakeholders
2. Prioritize updates based on business needs
3. Begin Phase 1 implementation
4. Test journey flow end-to-end (website → React app)
5. Iterate based on user feedback

---

## References

- `packages/app/CUSTOMER_JOURNEY_ALIGNMENT_REVIEW.md` - React project review
- `NewUpdate/vendorsoluce-outcome-driven-journey (3).md` - Journey strategy
- `NewUpdate/demo-vs-trial-strategy.md` - Demo/trial approach
- `NewUpdate/zero-friction-trial-strategy.md` - Trial implementation

---

**Document Status:** ✅ Complete  
**Last Updated:** January 2025  
**Next Review:** After Phase 1 implementation
