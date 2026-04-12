# VendorSoluce™ CSV Import - Validation Rules & Field Reference

## 📋 Quick Reference

### Field Types
| Field Name | Type | Required | Format | Example |
|------------|------|----------|--------|---------|
| Name | Text | ✅ Yes | Any text | `Amazon Web Services` |
| Category | Enum | ✅ Yes | critical\|strategic\|tactical\|commodity | `critical` |
| Data Types | List | ⚠️ Recommended | Semicolon-separated | `PII;Financial;Confidential` |
| Sector | Enum | ✅ Yes | See Sector List below | `Cloud Infrastructure` |
| Location | Text | ⚠️ Recommended | Country or region | `United States` |
| Contact | Email | ⚠️ Recommended | Valid email address | `security@vendor.com` |
| Notes | Text | ❌ Optional | Any text | `Primary cloud provider` |
| Provides Software | Boolean | ❌ Optional | Yes\|No | `Yes` |
| SBOM Available | Boolean | ❌ Optional | Yes\|No (only if Provides Software = Yes) | `Yes` |
| SBOM Format | Enum | ❌ Optional | SPDX\|CycloneDX\|SWID\|Custom\|N/A | `SPDX` |
| OSS Exposure | Enum | ❌ Optional | High\|Medium\|Low\|None\|Unknown | `Medium` |

---

## 🎯 Category Definitions

| Category | Risk Level | Description | Examples |
|----------|------------|-------------|----------|
| **critical** | Highest | Mission-critical vendors whose failure halts core operations | AWS, Okta, Payroll systems, Primary databases |
| **strategic** | High | Important vendors supporting key business functions | Salesforce, GitHub, Zoom, Security tools |
| **tactical** | Medium | Standard vendors for department/team needs | Project management, Marketing tools, Analytics |
| **commodity** | Low | Easily replaceable, low-risk vendors | Office supplies, Generic services |

**Impact on Risk Scoring:**
- Critical: Base risk +30 points
- Strategic: Base risk +20 points  
- Tactical: Base risk +10 points
- Commodity: Base risk +0 points

---

## 🔒 Data Type Definitions

| Data Type | Description | Risk Weight | Regulatory Impact |
|-----------|-------------|-------------|-------------------|
| **PII** | Personally Identifiable Information | +15 | GDPR, CCPA, State privacy laws |
| **PHI** | Protected Health Information | +20 | HIPAA (highest risk) |
| **Financial** | Financial data, payment info, bank accounts | +18 | PCI-DSS, SOX, GLBA |
| **IP** | Intellectual Property, source code, trade secrets | +16 | Trade secret laws |
| **Confidential** | General confidential business information | +12 | NDA, contractual obligations |
| **Public** | Public or non-sensitive information | +0 | None |

**Usage:**
- Separate multiple types with semicolons: `PII;Financial;Confidential`
- Order doesn't matter - system auto-calculates total risk
- Leave blank or use `Public` for non-sensitive vendors

---

## 🏢 Sector Options

| Sector | Common Vendors | Typical Risk Profile |
|--------|----------------|----------------------|
| Cloud Infrastructure | AWS, Azure, GCP, Cloudflare | High - mission critical |
| SaaS | Salesforce, Microsoft 365, Notion | Medium-High |
| Security | CrowdStrike, Okta, Palo Alto | High - security critical |
| Collaboration | Slack, Zoom, Teams | Medium |
| HR & Payroll | ADP, Workday, Gusto | High - sensitive PII/Financial |
| Payment Processing | Stripe, PayPal, Square | Very High - PCI compliance |
| Development Tools | GitHub, GitLab, Jira | Medium - IP risk |
| Marketing | HubSpot, Google Analytics, Mailchimp | Low-Medium |
| Data Storage | Snowflake, MongoDB, PostgreSQL | High - data concentration |
| Business Intelligence | Tableau, Power BI, Looker | Medium |
| Accounting | QuickBooks, Xero, Bill.com | High - financial data |
| Compliance | OneTrust, Vanta, Drata | Medium |
| Telecommunications | Twilio, RingCentral | Low-Medium |
| Other | Miscellaneous vendors | Varies |

---

## 🔧 SBOM (Software Bill of Materials) Fields

### When to Use SBOM Fields
✅ **Provide SBOM data if vendor:**
- Delivers installable software/code
- Provides containers, packages, or libraries
- Subject to EO 14028 requirements
- In regulated industries (government, healthcare, finance)

❌ **Skip SBOM fields if vendor:**
- Only provides hosted SaaS (no code delivery)
- Pure service provider (consulting, staffing)
- Hardware-only vendor
- Office supplies or commodities

### SBOM Format Standards

| Format | Description | Common Use |
|--------|-------------|------------|
| **SPDX** | Software Package Data Exchange (Linux Foundation) | Industry standard, government preferred |
| **CycloneDX** | OWASP standard for security-focused SBOM | Security tools, vulnerability scanning |
| **SWID** | Software Identification tags (ISO/IEC 19770-2) | Enterprise software inventory |
| **Custom** | Vendor-specific format | Proprietary systems |
| **N/A** | Not applicable | Non-software vendors |

### OSS Exposure Levels

| Level | Description | Risk Impact |
|-------|-------------|-------------|
| **High** | Significant open source dependencies (>50%) | +5 inherent risk |
| **Medium** | Moderate open source usage (20-50%) | +3 inherent risk |
| **Low** | Minimal open source (<20%) | +1 inherent risk |
| **None** | No open source components | +0 inherent risk |
| **Unknown** | OSS usage not disclosed | +4 inherent risk (assume medium-high) |

**Example SBOM Entries:**
```csv
GitHub,strategic,IP;Confidential,Development Tools,United States,security@github.com,Code repository,Yes,Yes,SPDX,High
Salesforce,strategic,PII;Financial,SaaS,United States,security@salesforce.com,CRM platform,No,No,,
```

---

## ✅ Validation Rules

### Required Field Validation
- **Name**: Cannot be empty, max 255 characters
- **Category**: Must be one of: critical, strategic, tactical, commodity (case-insensitive)
- **Sector**: Must match predefined sector list (case-sensitive)

### Optional Field Validation
- **Data Types**: If provided, each type must be valid (PII, PHI, Financial, IP, Confidential, Public)
- **Contact**: If provided, must be valid email format (name@domain.com)
- **SBOM Available**: Can only be "Yes" if "Provides Software" is "Yes"
- **SBOM Format**: Ignored if "SBOM Available" is "No"
- **OSS Exposure**: Ignored if "Provides Software" is "No"

### Import Behavior
- **Missing optional fields**: System uses defaults (empty strings, empty arrays)
- **Invalid category**: Defaults to "tactical"
- **Invalid data types**: Ignored (individual invalid types removed)
- **Invalid sector**: Defaults to "Other"
- **Invalid Yes/No**: Defaults to "No"

---

## 📊 Risk Calculation Formula

### Inherent Risk Score (0-100)

```
Base Risk = Category Weight

+ Data Type Weights (sum of all types)
+ Sector-specific adjustment
+ Location risk adjustment
+ SBOM/Software risk

= Inherent Risk (clamped 0-100)
```

### Residual Risk Score

```
Residual Risk = Inherent Risk × 0.88 + Random Jitter (-8 to +8)
```

### Risk Level Classification

| Residual Score | Risk Level | Color |
|----------------|------------|-------|
| 90-100 | **Critical** | Red |
| 70-89 | **High** | Orange |
| 40-69 | **Medium** | Yellow |
| 0-39 | **Low** | Green |

---

## 🚨 Common Import Errors

### Error: "Invalid CSV format"
**Cause**: Missing headers or malformed CSV
**Fix**: Ensure first row contains exact header names (case-insensitive)

### Error: "Vendor name required"
**Cause**: Empty Name field
**Fix**: Every row must have a vendor name

### Error: "Invalid category"
**Cause**: Category not in allowed list
**Fix**: Use only: critical, strategic, tactical, or commodity

### Error: "Invalid data type"
**Cause**: Unrecognized data type in Data Types field
**Fix**: Use only: PII, PHI, Financial, IP, Confidential, Public (semicolon-separated)

### Warning: "SBOM fields ignored"
**Cause**: SBOM data provided but "Provides Software" is "No"
**Fix**: Set "Provides Software" to "Yes" or remove SBOM fields

### Warning: "Duplicate vendor name"
**Cause**: Multiple vendors with same name
**Fix**: System imports all, but add unique identifiers to names if needed

---

## 💡 Best Practices

### Data Entry Tips
1. **Start small**: Import 5-10 critical vendors first to validate format
2. **Use Excel template**: Dropdowns prevent invalid entries
3. **Data types**: Be comprehensive - include all relevant types
4. **SBOM data**: Request from software vendors proactively
5. **Contact info**: Use security team contacts, not general support

### Data Quality
- **Accurate categorization**: Critical = truly business-critical only
- **Complete data types**: Don't underestimate vendor data access
- **Real contacts**: Use actual security/compliance contacts
- **Current info**: Review and update quarterly

### Bulk Imports
- **Pre-validate**: Test with 5 vendors before importing 100+
- **Review after**: Scan results to catch any import errors
- **Incremental**: Import by category/sector for easier validation
- **Backup first**: Export existing data before bulk import

---

## 📞 Support & Resources

**Template Files:**
- `vendorsoluce-import-template.csv` - Simple CSV with examples
- `vendorsoluce-import-template.xlsx` - Excel with validation & guide
- `vendorsoluce-bulk-import-sample.xlsx` - 20 pre-filled vendors

**Documentation:**
- Integration Guide: `INTEGRATION_GUIDE.md`
- Vendor Catalog: `vendor-catalog-enhanced.js`

**Validation Script (Optional):**
```python
# Use Python to validate CSV before import
import csv
import re

def validate_csv(filename):
    with open(filename, 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            if not row.get('Name'):
                print(f"❌ Missing name: {row}")
            if row.get('Category', '').lower() not in ['critical', 'strategic', 'tactical', 'commodity']:
                print(f"⚠️  Invalid category: {row.get('Name')}")
            if row.get('Contact') and not re.match(r'^[\w\.-]+@[\w\.-]+\.\w+$', row.get('Contact')):
                print(f"⚠️  Invalid email: {row.get('Name')} - {row.get('Contact')}")

validate_csv('your-import-file.csv')
```

---

**Version**: 1.0  
**Last Updated**: January 2026  
**License**: Proprietary - VendorSoluce™ by ERMITS
