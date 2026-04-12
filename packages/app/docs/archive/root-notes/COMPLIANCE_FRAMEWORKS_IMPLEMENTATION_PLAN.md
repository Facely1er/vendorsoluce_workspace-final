# Compliance Frameworks Implementation Plan
## Completing SOC2, ISO 27001, FedRAMP, and FISMA Support

**Date:** December 2025  
**Status:** 🚀 **IN PROGRESS**  
**Goal:** Complete all advertised compliance frameworks

---

## Current Status

### ✅ Already Implemented
- **NIST SP 800-161** - Fully functional (Supply Chain Assessment)
- **CMMC 2.0** - Fully functional (Vendor Assessments)

### ⚠️ Listed but Not Fully Implemented
- **SOC2 Type II** - Listed in product config, needs framework definition
- **ISO 27001** - Listed in product config, needs framework definition  
- **FedRAMP** - Listed in product config, needs framework definition
- **FISMA** - Listed in product config, needs framework definition

---

## Implementation Steps

### Step 1: Database Schema Extension ✅
**File:** `supabase/migrations/20250116_add_compliance_frameworks.sql`

**Changes:**
- Extend `framework_type` CHECK constraint to include:
  - `soc2_type_ii`
  - `iso_27001`
  - `fedramp`
  - `fisma`
  - `nist_sp_800_161` (for consistency)

**Status:** ✅ Migration created

---

### Step 2: Framework Definitions ✅
**File:** `supabase/migrations/20250116_add_compliance_frameworks.sql`

**Actions:**
- Insert framework records into `vs_assessment_frameworks` table
- Set appropriate metadata (name, description, estimated_time)
- Mark as active

**Status:** ✅ Framework records added to migration

---

### Step 3: Product Configuration Update
**File:** `src/lib/stripeProducts.ts`

**Current State:**
- Enterprise tier already lists: `['NIST', 'CMMC', 'SOC2', 'ISO27001', 'FEDRAMP', 'FISMA']`
- Federal tier already lists: `['FEDRAMP', 'FISMA', 'NIST', 'CMMC']`

**Action Needed:**
- ✅ No changes needed - frameworks already listed
- Verify framework names match database values

---

### Step 4: Framework Availability Check
**File:** `src/pages/Pricing.tsx`

**Current Implementation:**
```typescript
const hasFramework = (product, framework: string): boolean => {
  return product.complianceFrameworks.some(f => 
    f.toLowerCase().includes(framework.toLowerCase())
  );
};
```

**Action Needed:**
- ✅ Already works - checks product.complianceFrameworks array
- Frameworks will show as available once database migration runs

---

### Step 5: Assessment System Integration
**Files:**
- `src/pages/VendorSecurityAssessments.tsx` - Already supports multiple frameworks
- `src/hooks/useVendorAssessments.ts` - Already framework-agnostic

**Current State:**
- ✅ Assessment system already supports multiple frameworks
- ✅ Framework selection dropdown will automatically include new frameworks
- ✅ Assessment creation flow already works with any framework

**Action Needed:**
- ✅ No code changes needed - system is already framework-agnostic

---

### Step 6: Framework-Specific Questions (Future Enhancement)
**Status:** ⚠️ Optional - Can be added incrementally

**Note:** The system can work with frameworks that have 0 questions initially. Questions can be added:
- Via admin interface (if created)
- Via database migrations
- Via seed data

**Priority:** Medium - Framework structure is more important than questions initially

---

## Implementation Checklist

### Database & Backend ✅
- [x] Create migration to extend framework_type constraint
- [x] Add framework definitions to database
- [x] Create indexes for performance
- [ ] Run migration in development
- [ ] Run migration in production (before launch)

### Frontend Configuration ✅
- [x] Verify product config lists frameworks correctly
- [x] Verify pricing page framework check works
- [ ] Test framework selection in vendor assessments
- [ ] Verify framework appears in dropdowns

### Testing
- [ ] Test creating assessment with SOC2 framework
- [ ] Test creating assessment with ISO 27001 framework
- [ ] Test creating assessment with FedRAMP framework
- [ ] Test creating assessment with FISMA framework
- [ ] Verify framework filtering works
- [ ] Verify framework display in pricing page

---

## Quick Win Summary

**What's Already Done:**
1. ✅ Product configuration lists all frameworks
2. ✅ Assessment system supports multiple frameworks
3. ✅ Database migration created
4. ✅ Framework definitions ready

**What Needs to Happen:**
1. Run database migration
2. Test framework selection
3. Verify pricing page displays correctly

**Time Estimate:**
- Migration: 5 minutes
- Testing: 30 minutes
- **Total: ~35 minutes**

---

## Next Steps

1. **Run Migration:**
   ```sql
   -- In Supabase SQL Editor or via migration tool
   -- File: supabase/migrations/20250116_add_compliance_frameworks.sql
   ```

2. **Verify Frameworks Appear:**
   - Check vendor assessment framework dropdown
   - Verify pricing page shows frameworks as available

3. **Add Framework Questions (Optional - Future):**
   - Can add questions incrementally
   - System works with 0 questions initially
   - Questions can be added via admin or migrations

---

## Framework Details

### SOC2 Type II
- **Focus:** Security, Availability, Processing Integrity, Confidentiality, Privacy
- **Use Case:** Service organizations, SaaS providers
- **Assessment Type:** Vendor security assessments

### ISO 27001
- **Focus:** Information Security Management System (ISMS)
- **Use Case:** Organizations requiring ISO certification
- **Assessment Type:** Vendor security assessments

### FedRAMP
- **Focus:** Cloud security for federal agencies
- **Use Case:** Cloud service providers serving government
- **Assessment Type:** Vendor security assessments

### FISMA
- **Focus:** Federal information system security
- **Use Case:** Federal agencies and contractors
- **Assessment Type:** Vendor security assessments

---

**Report Generated:** December 2025  
**Status:** Ready for migration execution

