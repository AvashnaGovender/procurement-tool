# Tax Clearance / Good Standing Certificate Validation Guide

This guide explains how the AI system validates Tax Clearance and Good Standing certificates for South African supplier onboarding.

## Overview

The AI performs specific validations on SARS (South African Revenue Service) tax documents to ensure authenticity and data accuracy.

## Validation Process

### **When Analyzing Tax Clearance / Good Standing Documents:**

The AI receives:
1. **Document Content** - OCR-extracted text from SARS certificate
2. **Form Data** - Company name and address from supplier submission

### **Specific Validations Performed:**

#### **1. Company Name Validation** 🏢
- **Searches for**: Company name in the document
- **Extracts**: Company/business name found
- **Compares with**: Form field `companyName`
- **Result**:
  - ✅ **MATCH**: Names match
  - ❌ **MISMATCH**: Names don't match

#### **2. Taxpayer Name Validation** 👤
- **Searches for**: "Taxpayer Name", "Name of Taxpayer", "Entity Name"
- **Extracts**: Taxpayer name from document
- **Critical Rule**: **Taxpayer name MUST match company name**
- **Compares with**: Form field `companyName`
- **Result**:
  - ✅ **MATCH**: Taxpayer name matches company name
  - ❌ **MISMATCH**: Critical error - names don't match

#### **3. Address Validation** 📍
- **Searches for**: Physical address or registered address
- **Extracts**: Address from document
- **Compares with**: Form field `physicalAddress`
- **Result**:
  - ✅ **MATCH**: Addresses match
  - ⚠️ **PARTIAL MATCH**: Similar addresses
  - ❌ **MISMATCH**: Different addresses

#### **4. Purpose of Request Validation** 📋
- **Searches for**: "Purpose", "Purpose of Request", "Requested For"
- **Extracts**: Purpose stated in the document
- **Validates**: Must say "Good Standing" or "Tax Compliance" or "Tax Clearance"
- **Result**:
  - ✅ **CORRECT PURPOSE**: Shows "Good Standing"
  - ❌ **INCORRECT PURPOSE**: Shows different purpose (provide details)

#### **5. Tax Reference Number** 🔢
- **Searches for**: "Tax Reference Number", "Tax Number", "Income Tax Number"
- **Extracts**: Tax reference number
- **Reports**: Value found for record

#### **6. Validity/Expiry Check** 📅
- **Searches for**: "Valid Until", "Expiry Date", "Issue Date"
- **Extracts**: Validity date
- **Validates**: Certificate not older than 3 months
- **Result**:
  - ✅ **VALID**: Current and within 3 months
  - ⚠️ **EXPIRING SOON**: Close to 3 months
  - ❌ **EXPIRED**: Older than 3 months

#### **7. SARS/Government Authenticity** ✓
- **Checks for**:
  - SARS logo or letterhead
  - "South African Revenue Service"
  - Official stamps or reference numbers
  - Pin or verification code
- **Result**:
  - ✅ **AUTHENTIC**: Has official markers
  - ❌ **QUESTIONABLE**: Missing official markers

#### **8. Document Completeness** 📄
- Clear and readable?
- All fields visible?
- No missing information?

## Expected Validation Results

### **Example: Valid Tax Clearance Certificate**

```
COMPANY NAME VALIDATION: ✅ MATCH
- Document shows: "ABC Manufacturing (Pty) Ltd"
- Form Data: "ABC Manufacturing (Pty) Ltd"
- Status: Company names match exactly

TAXPAYER NAME VALIDATION: ✅ MATCH
- Taxpayer Name: "ABC Manufacturing (Pty) Ltd"
- Form Company Name: "ABC Manufacturing (Pty) Ltd"
- Status: Taxpayer name matches company name ✓

ADDRESS VALIDATION: ✅ MATCH
- Document shows: "123 Main Street, Johannesburg, Gauteng, 2001"
- Form Data: "123 Main Street, Johannesburg, 2001"
- Status: Addresses match

PURPOSE OF REQUEST VALIDATION: ✅ CORRECT PURPOSE
- Purpose stated: "Good Standing"
- Status: Correct purpose for supplier onboarding

TAX REFERENCE NUMBER: ✅ FOUND
- Tax Reference: 9123456789
- Successfully extracted

VALIDITY/EXPIRY CHECK: ✅ VALID
- Issue Date: 2024-10-01
- Age: 9 days (within 3 months requirement)
- Status: Certificate is current and valid

SARS AUTHENTICITY: ✅ AUTHENTIC
- SARS logo: Present
- "South African Revenue Service": Found
- Official stamp: Yes
- Pin/Reference: TCC-2024-123456

DOCUMENT COMPLETENESS: ✅ PASS
- Document clear and complete
- All required information present

OVERALL COMPLIANCE: ✅ PASS
Tax clearance is valid. All details verified.
Risk Level: LOW
```

### **Example: Taxpayer Name Mismatch**

```
COMPANY NAME VALIDATION: ⚠️ PARTIAL MATCH
- Document shows: "ABC Manufacturing"
- Form Data: "ABC Manufacturing (Pty) Ltd"

TAXPAYER NAME VALIDATION: ❌ MISMATCH
- Taxpayer Name: "ABC Industries (Pty) Ltd"
- Form Company Name: "ABC Manufacturing (Pty) Ltd"
- Status: CRITICAL ERROR - Taxpayer name does not match company name

ADDRESS VALIDATION: ✅ MATCH
PURPOSE OF REQUEST: ✅ CORRECT PURPOSE
VALIDITY: ✅ VALID
SARS AUTHENTICITY: ✅ AUTHENTIC

OVERALL COMPLIANCE: ❌ FAIL
RISK LEVEL: HIGH - Taxpayer name mismatch is a critical error
RECOMMENDATION: REJECT - This tax clearance belongs to a different entity
```

### **Example: Expired Certificate**

```
COMPANY NAME VALIDATION: ✅ MATCH
TAXPAYER NAME VALIDATION: ✅ MATCH
ADDRESS VALIDATION: ✅ MATCH
PURPOSE OF REQUEST: ✅ CORRECT PURPOSE

VALIDITY/EXPIRY CHECK: ❌ EXPIRED
- Issue Date: 2024-05-15
- Age: 148 days (OLDER THAN 3 MONTHS)
- Status: Certificate has expired

SARS AUTHENTICITY: ✅ AUTHENTIC

OVERALL COMPLIANCE: ❌ FAIL
RISK LEVEL: MEDIUM
RECOMMENDATION: Request updated tax clearance certificate (not older than 3 months)
```

### **Example: Wrong Purpose**

```
COMPANY NAME VALIDATION: ✅ MATCH
TAXPAYER NAME VALIDATION: ✅ MATCH
ADDRESS VALIDATION: ✅ MATCH

PURPOSE OF REQUEST VALIDATION: ❌ INCORRECT PURPOSE
- Purpose stated: "Tender Submission"
- Expected: "Good Standing" or "Tax Clearance"
- Status: Document requested for different purpose

VALIDITY: ✅ VALID
SARS AUTHENTICITY: ✅ AUTHENTIC

OVERALL COMPLIANCE: ⚠️ WARNING
RISK LEVEL: MEDIUM
RECOMMENDATION: Request certificate specifically for "Good Standing" purpose
```

## Risk Scoring Impact

| Validation Result | Risk Impact |
|-------------------|-------------|
| All validations pass | +0 points (Low Risk) |
| Document 3-4 months old | +10 points (Medium Risk) |
| Document older than 4 months | +20 points (High Risk) |
| Address mismatch | +10 points (Medium Risk) |
| Taxpayer name mismatch | +35 points (Critical Risk - possible fraud) |
| Wrong purpose | +15 points (High Risk) |
| No SARS markers | +25 points (High Risk) |
| Company name mismatch | +20 points (High Risk) |

## Implementation Details

### **File**: `worker/crew_agents.py`
- **Function**: `analyze_document_with_ollama()`
- **Lines**: 262-329 (Tax validation prompt)

### **Form Fields Used**:
```python
{
  "companyName": str,      # Company name - must match taxpayer name
  "physicalAddress": str   # Address for verification
}
```

### **Document Types Validated**:
- Tax Clearance Certificate
- Good Standing Certificate  
- Tax Compliance Status Pin

## Key Compliance Requirements

### **SARS Tax Clearance Requirements:**

1. **Age Limit**: Not older than 3 months
2. **Purpose**: Must state "Good Standing" or "Tax Clearance"
3. **Taxpayer Match**: Taxpayer name = Company name (critical)
4. **Official**: Must have SARS logo and stamps
5. **Complete**: All fields must be filled

### **Acceptable Variations:**

**Company Name**:
- ✅ "ABC (Pty) Ltd" = "ABC Pty Ltd" (acceptable)
- ✅ "ABC Manufacturing" = "ABC Manufacturing (Pty) Ltd" (acceptable if partial)
- ❌ "ABC Industries" ≠ "ABC Manufacturing" (reject)

**Address**:
- ✅ "123 Main St" = "123 Main Street" (acceptable)
- ✅ Short form included in long form (acceptable)
- ❌ Different street/city (reject)

## Fraud Detection

### **Red Flags:**
- 🚩 Taxpayer name completely different from company name
- 🚩 No SARS logo or official markers
- 🚩 Document older than 6 months
- 🚩 Poor quality/photocopied multiple times
- 🚩 Address in different province/city
- 🚩 Wrong purpose stated

### **Automatic Rejection Criteria:**
- Taxpayer name doesn't match company name
- Document older than 6 months
- No SARS authentication markers
- Purpose not related to good standing

## Example Tax Reference Numbers

South African tax numbers follow formats:
- **Income Tax**: 10 digits (e.g., 9123456789)
- **VAT**: Starts with "4" (e.g., 4123456789)
- **PAYE**: 7 digits + 3 digits (e.g., 7123456/123)

## Integration with Risk Assessment

Tax validation results feed into overall analysis:

```python
# Critical issues increase risk significantly
if taxpayer_name_mismatch:
    risk_score += 35  # Critical
if certificate_expired:
    risk_score += 20  # High
if wrong_purpose:
    risk_score += 15  # High

Overall Risk: HIGH
Recommendation: REJECT or REQUEST REVISION
```

## Processing Flow

```
Supplier fills form (company name, address)
      ↓
Uploads Tax Clearance Certificate
      ↓
Procurement manager runs AI analysis
      ↓
Ollama extracts:
  - Company name from certificate
  - Taxpayer name from certificate
  - Address from certificate
  - Purpose from certificate
      ↓
Compares each field with form data
      ↓
Validates:
  ✓ Taxpayer name = Company name?
  ✓ Purpose = "Good Standing"?
  ✓ Address matches?
  ✓ Document age < 3 months?
      ↓
Returns PASS/FAIL for each check
```

## Common Issues

### **Issue**: Taxpayer name format differs
**Example**: 
- Certificate: "ABC MANUFACTURING (PTY) LTD"
- Form: "ABC Manufacturing (Pty) Ltd"
**Solution**: AI recognizes case variations as match

### **Issue**: Purpose says "Tax Compliance Status"
**Status**: Acceptable (equivalent to Good Standing)

### **Issue**: Purpose says "Tender Application"
**Status**: Reject - wrong purpose

### **Issue**: No expiry date shown
**Solution**: Use issue date + 3 months rule

## Validation Summary Table

| Field | Required | Critical | Notes |
|-------|----------|----------|-------|
| Company Name | Yes | Medium | Must be present |
| Taxpayer Name | Yes | **Critical** | MUST match company name |
| Address | Yes | Low | Partial match acceptable |
| Purpose | Yes | High | Must say "Good Standing" |
| Tax Reference | No | Low | For record keeping |
| Validity Date | Yes | High | Must be < 3 months old |
| SARS Markers | Yes | High | Logo, stamps required |

## Future Enhancements

Planned improvements:
- [ ] Validate tax reference number format
- [ ] Check tax compliance status (green/amber/red)
- [ ] Cross-reference with company registration
- [ ] Validate SARS pin authenticity
- [ ] Alert if approaching 3-month limit
- [ ] Check for outstanding tax debt mentions

## Support

For tax validation issues:
1. Ensure certificate shows "Good Standing" purpose
2. Verify taxpayer name exactly matches company name
3. Check document is recent (<3 months)
4. Look for SARS logo and official markers
5. Manual review if AI uncertain about match

## Compliance Notes

- Tax clearance certificates expire after 12 months
- For onboarding purposes, should be <3 months old
- Taxpayer name mismatch is grounds for rejection
- Purpose must explicitly state "Good Standing"
- Missing SARS markers indicate potential fraud

