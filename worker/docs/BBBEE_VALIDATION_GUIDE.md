# B-BBEE Certificate Validation Guide

This guide explains how the AI system validates B-BBEE (Broad-Based Black Economic Empowerment) certificates for South African supplier onboarding.

## Overview

The AI performs specific validations on B-BBEE certificates to ensure authenticity, extract key metrics, and verify compliance with supplier form submissions.

## Validation Process

### **When Analyzing B-BBEE Accreditation Documents:**

The AI receives:
1. **Document Content** - OCR-extracted text from the uploaded certificate
2. **Form Data** - B-BBEE Status Level the supplier entered in the form

### **Specific Validations Performed:**

#### **1. B-BBEE Certificate Verification** 🔍
- **Searches for official markers**:
  - "Department: Trade, Industry and Competition"
  - "REPUBLIC OF SOUTH AFRICA"
  - "B-BBEE CERTIFICATE" or "BEE CERTIFICATE"
- **Result**: 
  - ✅ **VALID B-BBEE CERTIFICATE** if all markers found
  - ❌ **NOT A VALID B-BBEE CERTIFICATE** if missing

#### **2. Black Ownership Percentage** 📊
- **Searches for**: "Black Ownership" or "Black Ownership Percentage"
- **Extracts**: Percentage value (e.g., "51.2%", "100%")
- **Reports**: Actual value found
- **Result**:
  - ✅ **VALUE FOUND**: Reports percentage
  - ❌ **NOT FOUND**: Missing critical information

#### **3. Black Female Percentage** 👥
- **Searches for**: "Black Female", "Black Female Percentage", or "Black Women"
- **Extracts**: Percentage value (e.g., "30.5%")
- **Reports**: Actual value found
- **Result**:
  - ✅ **VALUE FOUND**: Reports percentage
  - ❌ **NOT FOUND**: Missing information

#### **4. B-BBEE Status Level Validation** ⭐
- **Searches for**: "B-BBEE Status", "BEE Level", "Level", "Status Level"
- **Extracts**: Status level (Level 1, Level 2, etc.)
- **Compares with**: Form field `bbbeeLevel`
- **Result**:
  - ✅ **MATCH**: Levels match
  - ❌ **MISMATCH**: Form data doesn't match certificate (details provided)

#### **5. Expiry Date Validation** 📅
- **Searches for**: "Valid Until", "Expiry Date", "Valid To", "Validity"
- **Extracts**: Expiry date
- **Validates**: Certificate not expired
- **Calculates**: Days until expiry
- **Result**:
  - ✅ **VALID**: Certificate current and valid
  - ⚠️ **EXPIRING SOON**: Valid but expires within 90 days
  - ❌ **EXPIRED**: Certificate has expired

#### **6. Document Completeness** 📄
- Clear and readable?
- All critical fields visible?
- Any missing information?

## Expected Validation Results

### **Example: Valid B-BBEE Certificate**

```
B-BBEE CERTIFICATE VERIFICATION: ✅ VALID B-BBEE CERTIFICATE
- Found "Department: Trade, Industry and Competition"
- Found "REPUBLIC OF SOUTH AFRICA"
- Found "B-BBEE CERTIFICATE"
- Document is authentic

BLACK OWNERSHIP PERCENTAGE: ✅ 51.2%
- Successfully extracted from certificate
- Company has majority black ownership

BLACK FEMALE PERCENTAGE: ✅ 30.5%
- Successfully extracted from certificate
- Strong female representation

B-BBEE STATUS LEVEL VALIDATION: ✅ MATCH
- Certificate shows: "Level 2"
- Form Data: "Level 2"
- Status levels match exactly

EXPIRY DATE VALIDATION: ✅ VALID
- Expiry Date: 2025-12-31
- Days until expiry: 447 days
- Certificate is currently valid

DOCUMENT COMPLETENESS: ✅ PASS
- Document is clear and readable
- All required fields present
- No missing information

OVERALL COMPLIANCE: ✅ PASS
Recommendation: Certificate is valid and all data matches. Approved.
```

### **Example: Invalid Certificate (Expired)**

```
B-BBEE CERTIFICATE VERIFICATION: ✅ VALID B-BBEE CERTIFICATE
- Document format is correct

BLACK OWNERSHIP PERCENTAGE: ✅ 65.0%
BLACK FEMALE PERCENTAGE: ✅ 35.0%
B-BBEE STATUS LEVEL VALIDATION: ✅ MATCH

EXPIRY DATE VALIDATION: ❌ EXPIRED
- Expiry Date: 2023-06-30
- Status: EXPIRED (expired 542 days ago)
- Certificate is no longer valid

OVERALL COMPLIANCE: ❌ FAIL
Recommendation: Certificate has expired. Request updated B-BBEE certificate.
Risk Level: HIGH
```

### **Example: Status Level Mismatch**

```
B-BBEE CERTIFICATE VERIFICATION: ✅ VALID B-BBEE CERTIFICATE

BLACK OWNERSHIP PERCENTAGE: ✅ 45.8%
BLACK FEMALE PERCENTAGE: ✅ 25.0%

B-BBEE STATUS LEVEL VALIDATION: ❌ MISMATCH
- Certificate shows: "Level 4"
- Form Data: "Level 2"
- Status: Supplier claimed higher level than certificate shows

EXPIRY DATE VALIDATION: ✅ VALID

OVERALL COMPLIANCE: ❌ FAIL
Recommendation: Status level mismatch detected. Request revision or reject.
Risk Level: HIGH - Possible misrepresentation
```

### **Example: Invalid Document (Not B-BBEE)**

```
B-BBEE CERTIFICATE VERIFICATION: ❌ NOT A VALID B-BBEE CERTIFICATE
- Missing "Department: Trade, Industry and Competition"
- Missing "B-BBEE CERTIFICATE" text
- This appears to be a different document type

OVERALL COMPLIANCE: ❌ FAIL
Recommendation: Invalid document. Request official B-BBEE certificate from accredited agency.
Risk Level: HIGH
```

## Risk Scoring Impact

B-BBEE validation results affect the overall supplier risk score:

| Validation Result | Risk Impact |
|-------------------|-------------|
| Valid certificate, all match | +0 points (Low Risk) |
| Expiring within 90 days | +5 points (Medium Risk) |
| Status level mismatch | +20 points (High Risk) |
| Expired certificate | +30 points (High Risk) |
| Invalid/wrong document | +40 points (Critical Risk) |
| Missing ownership data | +10 points (Medium Risk) |

## Implementation Details

### **File**: `worker/crew_agents.py`
- **Function**: `analyze_document_with_ollama()`
- **Lines**: 135-185 (B-BBEE validation prompt)

### **Form Fields Used**:
```python
bbbeeLevel: str  # "Level 1", "Level 2", etc.
companyName: str # For reference
```

### **Documents Validated**:
- B-BBEE Accreditation Certificate
- B-BBEE Scorecard (if submitted)
- Affidavits (alternative to certificate)

## Common B-BBEE Status Levels

- **Level 1**: 135% Procurement Recognition (Best)
- **Level 2**: 125% Procurement Recognition
- **Level 3**: 110% Procurement Recognition
- **Level 4**: 100% Procurement Recognition
- **Level 5-8**: Decreasing procurement recognition
- **Non-Compliant**: 0% Procurement Recognition

## Validation Examples by Level

### **Level 1 Certificate**
Expected to show:
- Black Ownership: ≥ 25%
- Economic Interest: ≥ 25%
- Voting Rights: ≥ 25%
- High compliance score

### **EME (Exempted Micro Enterprise)**
- Turnover < R10 million
- Automatically Level 4
- May have simplified certificate

### **QSE (Qualifying Small Enterprise)**
- Turnover R10m - R50m
- Certificate shows ownership percentages
- May use affidavit alternative

## Error Handling

If validation fails:
1. **Document not readable**: Requests higher quality scan
2. **Missing fields**: Identifies specific missing data
3. **Format issues**: Suggests correct document type
4. **Expiry issues**: Requests renewal

## Integration with Compliance Check

The B-BBEE analysis feeds into overall compliance:

```python
# If B-BBEE validation shows issues:
compliance_results = """
B-BBEE Compliance: FAILED
- Certificate expired
- Status level mismatch detected
- Requires immediate attention

RECOMMENDATION: Request updated B-BBEE certificate with correct status level.
"""
```

## Testing the Validation

1. Upload a B-BBEE certificate
2. Open AI Insights tab
3. Click "Start AI Analysis"
4. Review the detailed validation results

Look for structured output with each validation clearly marked.

## Future Enhancements

Planned improvements:
- [ ] Validate issuing agency accreditation
- [ ] Cross-check procurement recognition percentage
- [ ] Validate skills development score
- [ ] Check enterprise development contribution
- [ ] Verify preferential procurement scores
- [ ] Alert if certificate expires within 6 months

## Troubleshooting

**Issue**: B-BBEE status not found
- **Cause**: OCR quality, document format
- **Solution**: Request clearer scan or PDF version

**Issue**: Expiry date not detected
- **Cause**: Non-standard date format
- **Solution**: Manual review needed

**Issue**: Ownership percentages not extracted
- **Cause**: Certificate uses scorecard format
- **Solution**: May need scorecard-specific parsing

## Compliance Notes

- B-BBEE certificates are valid for 12 months
- Must be issued by accredited verification agency
- Affidavits valid for EMEs only
- Status level must match procurement recognition
- Expired certificates are non-compliant

## Support

For B-BBEE validation issues:
1. Check document is official certificate (not scorecard summary)
2. Ensure form data includes correct B-BBEE level
3. Review AI analysis logs for extraction details
4. Verify certificate is from accredited agency

