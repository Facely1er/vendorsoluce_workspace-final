# Quick Wins Usage Guide

**Quick reference for using migrated components**

---

## 🚀 Quick Start

### 1. HelpButton (Already Integrated ✅)

The HelpButton is already added to the Navbar. No action needed!

**Location**: Automatically visible in navigation bar

---

### 2. ContextualHelp

Add contextual help tooltips to any form or feature:

```tsx
import ContextualHelp from '../components/help/ContextualHelp';

// Example: Vendor onboarding form
<div className="flex items-center gap-2">
  <label htmlFor="companyName">Company Name</label>
  <ContextualHelp
    helpId="company-name"
    title="Company Name"
    content="Enter the legal name of the vendor company. This will be used for official documentation and compliance records."
    position="right"
    relatedTopics={['vendor management', 'compliance']}
  />
</div>
```

**Best Places to Add**:
- Vendor onboarding wizard fields
- Assessment question forms
- SBOM upload sections
- Risk scoring explanations

---

### 3. ProgressRing

Replace progress bars with circular progress indicators:

```tsx
import { ProgressRing } from '../components/ui/ProgressRing';

// Basic usage
<ProgressRing percentage={75} />

// Assessment completion
<ProgressRing 
  percentage={assessmentProgress} 
  size="lg"
  color={assessmentProgress > 80 ? 'success' : assessmentProgress > 50 ? 'warning' : 'danger'}
/>

// Vendor onboarding progress
<ProgressRing percentage={onboardingProgress}>
  <div className="text-center">
    <div className="text-2xl font-bold">{onboardingProgress}%</div>
    <div className="text-xs text-gray-500">Complete</div>
  </div>
</ProgressRing>
```

**Replace Existing**:
- Assessment progress bars
- Vendor onboarding progress
- Dashboard completion metrics

---

### 4. SearchInput

Enhance search functionality with debounced input:

```tsx
import SearchInput from '../components/ui/SearchInput';

// Basic search
<SearchInput
  placeholder="Search vendors..."
  onSearch={(query) => {
    filterVendors(query);
  }}
/>

// Controlled search with state
const [searchQuery, setSearchQuery] = useState('');

<SearchInput
  value={searchQuery}
  onChange={setSearchQuery}
  onSearch={handleSearch}
  debounceMs={300}
  autoFocus={true}
/>
```

**Add To**:
- Vendor dashboard search
- Vendor risk table
- Assessment list
- SBOM analysis search

---

## 📍 Integration Examples

### Example 1: Vendor Onboarding Form

```tsx
// In VendorOnboardingWizard.tsx
import ContextualHelp from '../components/help/ContextualHelp';
import { ProgressRing } from '../components/ui/ProgressRing';

// Add contextual help to form fields
<div className="mb-4">
  <div className="flex items-center gap-2 mb-2">
    <label htmlFor="industry">Industry</label>
    <ContextualHelp
      helpId="industry-selection"
      title="Industry Selection"
      content="Select the primary industry of the vendor. This helps determine relevant compliance requirements and risk factors."
      position="right"
    />
  </div>
  <select id="industry">...</select>
</div>

// Add progress ring to show completion
<div className="mb-6">
  <ProgressRing 
    percentage={calculateProgress()} 
    size="md"
    color="primary"
  />
  <p className="text-sm text-gray-600 mt-2">
    {calculateProgress()}% complete
  </p>
</div>
```

### Example 2: Vendor Dashboard

```tsx
// In VendorDashboard.tsx
import SearchInput from '../components/ui/SearchInput';
import { ProgressRing } from '../components/ui/ProgressRing';

// Add search to vendor list
<div className="mb-4">
  <SearchInput
    placeholder="Search vendors by name, industry, or risk level..."
    onSearch={(query) => {
      setSearchQuery(query);
      filterVendors(query);
    }}
    debounceMs={300}
  />
</div>

// Use progress ring for risk scores
{vendors.map(vendor => (
  <div key={vendor.id} className="flex items-center gap-4">
    <ProgressRing 
      percentage={vendor.riskScore}
      size="sm"
      color={vendor.riskScore > 70 ? 'danger' : vendor.riskScore > 40 ? 'warning' : 'success'}
    />
    <div>
      <div className="font-semibold">{vendor.name}</div>
      <div className="text-sm text-gray-500">Risk: {vendor.riskScore}/100</div>
    </div>
  </div>
))}
```

### Example 3: Assessment Page

```tsx
// In AssessmentResults.tsx
import ContextualHelp from '../components/help/ContextualHelp';
import { ProgressRing } from '../components/ui/ProgressRing';

// Add help to assessment sections
<div className="mb-6">
  <div className="flex items-center gap-2 mb-4">
    <h3>Risk Assessment</h3>
    <ContextualHelp
      helpId="risk-assessment"
      title="Risk Assessment"
      content="This section evaluates vendor risk across multiple dimensions including security, compliance, and business continuity."
      position="right"
      articleUrl="/docs/risk-assessment"
      relatedTopics={['NIST SP 800-161', 'compliance', 'risk scoring']}
    />
  </div>
  {/* Assessment content */}
</div>

// Show assessment completion
<ProgressRing 
  percentage={assessmentCompletion}
  size="lg"
  color={assessmentCompletion === 100 ? 'success' : 'primary'}
/>
```

---

## 🎨 Styling Notes

All components use vendorsoluce.com's design system:

- **Primary Color**: `vendorsoluce-green`
- **Hover**: `vendorsoluce-pale-green`
- **Dark Mode**: Fully supported
- **Spacing**: Consistent with existing components

---

## ✅ Checklist

- [x] HelpButton integrated in Navbar
- [ ] Add ContextualHelp to vendor onboarding
- [ ] Add ContextualHelp to assessment forms
- [ ] Replace progress bars with ProgressRing
- [ ] Add SearchInput to vendor dashboard
- [ ] Add SearchInput to vendor table
- [ ] Test all components in dark mode
- [ ] Verify responsive design

---

**See `MIGRATION_QUICK_WINS_COMPLETE.md` for full migration details.**

