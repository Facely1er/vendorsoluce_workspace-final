# Website Folder Cleanup Review

**Date:** 2025-01-27  
**Purpose:** Identify outdated, unnecessary, and duplicate files for cleanup

---

## 🗑️ Files Recommended for Deletion

### 1. Backup/Old Version Files (High Priority)

#### `index.new.html` and `index.updated.v2.html`
- **Status:** Backup versions of `index.html`
- **Evidence:** 
  - `index.new.html` has 678 differences from current `index.html`
  - No references found in codebase
  - Appear to be work-in-progress backups
- **Recommendation:** ✅ **DELETE** - These are old versions that are no longer needed

### 2. Temporary/Unused Folder (High Priority)

#### `New folder/` directory
- **Contents:** 
  - `features.html`
  - `how-it-works.html`
  - `trust.html`
- **Status:** Files have different hashes than main directory versions (not exact duplicates)
- **Evidence:** No references found in codebase
- **Recommendation:** ⚠️ **REVIEW THEN DELETE** - Likely old work-in-progress files. Compare with main versions first to ensure no unique content is lost.

### 3. Test Files (Medium Priority)

#### `radar/test-radar.html`
- **Status:** Test suite file for Vendor Risk Radar
- **Evidence:** Appears to be a development testing file
- **Recommendation:** ⚠️ **REVIEW** - Keep if still used for testing, delete if testing is complete and no longer needed

---

## 📄 Documentation Files - Review Needed

### Outdated Review/Analysis Documents (Medium Priority)

These markdown files appear to be completed review/analysis documents that may no longer be needed:

#### Root Level Review Documents:
1. **`HEADER_FOOTER_STANDARDIZATION_REVIEW.md`** - Review document for header/footer standardization
2. **`HEADER_STYLING_REVIEW.md`** - Review document for header styling updates
3. **`VENDORSOLUCE_WORKFLOW_ALIGNMENT_REVIEW.md`** - Workflow alignment review (dated 2026-01-03)
4. **`WEBSITE_REACT_ALIGNMENT_REVIEW.md`** - React alignment review (dated January 2025)

**Recommendation:** ⚠️ **ARCHIVE OR DELETE** - These appear to be completed analysis documents. Consider:
- Moving to a `/docs/archive/` folder if historical reference is needed
- Deleting if changes have been implemented and documents are no longer relevant

#### Radar Folder Review Documents:
1. **`radar/FIXES_APPLIED.md`** - Lists fixes applied (dated 2025-01-27)
2. **`radar/IMPLEMENTATION_SUMMARY.md`** - Implementation summary
3. **`radar/IMPLEMENTATION_FINAL.md`** - Final implementation summary
4. **`radar/TESTING_COMPLETE.md`** - Testing completion document
5. **`radar/FINAL_VERIFICATION.md`** - Final verification document
6. **`radar/DATA_INGESTION_FIXES.md`** - Data ingestion fixes documentation
7. **`radar/VENDOR_RADAR_REVIEW.md`** - Vendor radar review
8. **`radar/VENDOR_THREAT_RADAR_ANALYSIS.md`** - Threat radar analysis
9. **`radar/USER_JOURNEY_ALIGNMENT_REVIEW.md`** - User journey alignment review

**Recommendation:** ⚠️ **ARCHIVE OR DELETE** - These appear to be completed implementation/analysis documents. Consider:
- Consolidating into a single `radar/IMPLEMENTATION_HISTORY.md` if historical reference is needed
- Moving to `/docs/archive/` folder
- Deleting if no longer needed for reference

### Active Documentation (Keep)

These documentation files appear to be active references:

1. **`BUILD_INSTRUCTIONS.md`** - ✅ **KEEP** - Active build instructions
2. **`PRODUCTION_SETUP.md`** - ✅ **KEEP** - Production setup guide (has checklist items)
3. **`radar/CSV_VALIDATION_REFERENCE.md`** - ✅ **KEEP** - Reference documentation
4. **`radar/INTEGRATION_GUIDE.md`** - ✅ **KEEP** - Integration guide
5. **`radar/USER_JOURNEY_GUIDE.md`** - ✅ **KEEP** - User guide
6. **`assessment/README.md`** - ✅ **KEEP** - Assessment module documentation
7. **`assets/images/README.md`** - ✅ **KEEP** - Assets documentation

---

## 📊 Summary Statistics

- **Total files reviewed:** ~50+ files
- **Files recommended for deletion:** 2-3 files (backup HTML files)
- **Folders recommended for deletion:** 1 folder (`New folder/`)
- **Documentation files to review:** 13 review/analysis documents
- **Test files to review:** 1 file (`test-radar.html`)

---

## 🎯 Recommended Action Plan

### Phase 1: Safe Deletions (Low Risk)
1. Delete `index.new.html`
2. Delete `index.updated.v2.html`

### Phase 2: Review & Archive (Medium Risk)
1. Compare `New folder/` contents with main directory files
2. If no unique content, delete `New folder/` directory
3. Review `radar/test-radar.html` - delete if testing complete

### Phase 3: Documentation Cleanup (Low Risk)
1. Create `/docs/archive/` folder if it doesn't exist
2. Move completed review documents to archive OR delete if no longer needed
3. Consider consolidating radar implementation documents

---

## ⚠️ Important Notes

- **Always backup before deletion** - Consider creating a git commit or backup before cleanup
- **Review "New folder" carefully** - Files have different hashes, may contain unique content
- **Check git history** - Review when files were last modified to understand their purpose
- **Team consultation** - Verify with team that review documents are no longer needed

---

## ✅ Files to Keep (Confirmed)

- All active HTML pages (`index.html`, `about.html`, `features.html`, etc.)
- All includes (`includes/header.html`, `includes/footer.html`, etc.)
- All active documentation (`BUILD_INSTRUCTIONS.md`, `PRODUCTION_SETUP.md`, etc.)
- All configuration files (`package.json`, `tailwind.config.js`, `netlify.toml`, etc.)
- All assets and legal pages
- All radar production files (`vendor-risk-radar.html`, `vendor-threat-radar.html`)
