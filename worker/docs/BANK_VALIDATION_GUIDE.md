# Bank Confirmation Letter Validation Guide

This guide explains how the AI system validates Bank Confirmation Letters for South African supplier onboarding.

## Overview

The AI performs specific validations on bank confirmation letters by cross-referencing banking details with supplier form submissions to ensure accuracy and prevent fraud.

## Validation Process

### **When Analyzing Bank Confirmation Letters:**

The AI receives:
1. **Document Content** - OCR-extracted text from the bank letter
2. **Form Data** - Banking information the supplier entered

### **Specific Validations Performed:**

#### **1. Company Name Validation** 🏢
- **Searches for**: Company name or account holder name in the letter
- **Extracts**: Name found in the document
- **Compares with**: Form fields `companyName` OR `bankAccountName`
- **Result**:
  - ✅ **MATCH**: Names match
  - ❌ **MISMATCH**: Names don't match (details provided)

#### **2. Bank Name Validation** 🏦
- **Searches for**: Bank name (FNB, Standard Bank, ABSA, Nedbank, Capitec, etc.)
- **Extracts**: Bank name from letterhead or text
- **Compares with**: Form field `bankName`
- **Result**:
  - ✅ **MATCH**: Bank names match
  - ❌ **MISMATCH**: Wrong bank (details provided)

#### **3. Branch Name Validation** 📍
- **Searches for**: Branch name or branch location
- **Extracts**: Branch name/location found
- **Compares with**: Form field `branchName`
- **Result**:
  - ✅ **MATCH**: Exact match
  - ⚠️ **PARTIAL MATCH**: Similar (e.g., "JHB Central" vs "Johannesburg Central")
  - ❌ **MISMATCH**: Different branches

#### **4. Branch Code Validation** 🔢
- **Searches for**: "Branch Code", "Branch Number", "Universal Branch Code"
- **Extracts**: Branch code (e.g., "250655")
- **Compares with**: Form field `branchNumber`
- **Result**:
  - ✅ **MATCH**: Codes match exactly
  - ❌ **MISMATCH**: Wrong branch code

#### **5. Account Number Validation** 💳
- **Searches for**: "Account Number", "Account No"
- **Extracts**: Account number (may be partially masked: ****1234)
- **Compares with**: Form field `accountNumber`
- **Result**:
  - ✅ **MATCH**: Numbers match exactly
  - ⚠️ **PARTIAL MATCH**: Masked but last digits match
  - ❌ **MISMATCH**: Numbers don't match

#### **6. Account Type Validation** 📋
- **Searches for**: Account type ("Cheque", "Current", "Savings", "Business")
- **Extracts**: Account type from letter
- **Compares with**: Form field `typeOfAccount`
- **Result**:
  - ✅ **MATCH**: Account types match
  - ❌ **MISMATCH**: Different account type

#### **7. Document Authenticity** ✓
- **Checks for**:
  - Bank letterhead or logo
  - Bank stamp or official seal
  - Date (should be recent, not older than 3 months)
  - Signature
- **Result**:
  - ✅ **AUTHENTIC**: Has official markers
  - ⚠️ **QUESTIONABLE**: Missing some markers

#### **8. Document Completeness** 📄
- Clear and readable?
- All critical fields visible?
- Any missing information?

## Expected Validation Results

### **Example: Valid Bank Confirmation**

```
COMPANY NAME VALIDATION: ✅ MATCH
- Letter shows: "ABC Manufacturing (Pty) Ltd"
- Form Data: "ABC Manufacturing (Pty) Ltd"
- Status: Names match exactly

BANK NAME VALIDATION: ✅ MATCH
- Letter shows: "First National Bank"
- Form Data: "FNB"
- Status: Bank names match (FNB = First National Bank)

BRANCH NAME VALIDATION: ✅ MATCH
- Letter shows: "Sandton City Branch"
- Form Data: "Sandton City"
- Status: Branch names match

BRANCH CODE VALIDATION: ✅ MATCH
- Letter shows: "250655"
- Form Data: "250655"
- Status: Branch codes match exactly

ACCOUNT NUMBER VALIDATION: ✅ MATCH
- Letter shows: "62********789"
- Form Data: "62123456789"
- Status: Last digits match (masked account number)

ACCOUNT TYPE VALIDATION: ✅ MATCH
- Letter shows: "Business Cheque Account"
- Form Data: "Cheque"
- Status: Account types match

DOCUMENT AUTHENTICITY: ✅ AUTHENTIC
- Bank letterhead present: FNB logo visible
- Official stamp: Yes
- Date: 2024-10-05 (5 days old - within 3 months)
- Signature: Present

DOCUMENT COMPLETENESS: ✅ PASS
- All information clearly visible
- No missing fields

OVERALL COMPLIANCE: ✅ PASS
All banking details verified. Document is authentic and current.
```

### **Example: Account Number Mismatch**

```
COMPANY NAME VALIDATION: ✅ MATCH
BANK NAME VALIDATION: ✅ MATCH
BRANCH NAME VALIDATION: ✅ MATCH
BRANCH CODE VALIDATION: ✅ MATCH

ACCOUNT NUMBER VALIDATION: ❌ MISMATCH
- Letter shows: "62********123"
- Form Data: "62987654789"
- Status: Account numbers do not match (last digits: 123 vs 789)

ACCOUNT TYPE VALIDATION: ✅ MATCH
DOCUMENT AUTHENTICITY: ✅ AUTHENTIC

OVERALL COMPLIANCE: ❌ FAIL
RISK LEVEL: HIGH - Account number mismatch detected
RECOMMENDATION: REJECT or request revision - critical banking detail discrepancy
```

### **Example: Expired/Old Document**

```
COMPANY NAME VALIDATION: ✅ MATCH
BANK NAME VALIDATION: ✅ MATCH
(all other validations PASS)

DOCUMENT AUTHENTICITY: ⚠️ QUESTIONABLE
- Bank letterhead: Present
- Official stamp: Present
- Date: 2024-01-15 (9 months old - OLDER THAN 3 MONTHS)
- Status: Document is outdated

OVERALL COMPLIANCE: ⚠️ WARNING
RECOMMENDATION: Request updated bank confirmation letter (not older than 3 months)
RISK LEVEL: MEDIUM
```

### **Example: Wrong Branch**

```
COMPANY NAME VALIDATION: ✅ MATCH
BANK NAME VALIDATION: ✅ MATCH

BRANCH NAME VALIDATION: ❌ MISMATCH
- Letter shows: "Cape Town Branch"
- Form Data: "Johannesburg Branch"
- Status: Different branches

BRANCH CODE VALIDATION: ❌ MISMATCH
- Letter shows: "051001"
- Form Data: "250655"
- Status: Branch codes don't match

OVERALL COMPLIANCE: ❌ FAIL
RISK LEVEL: HIGH - Banking details mismatch
RECOMMENDATION: Request revision - supplier must clarify correct branch
```

## Risk Scoring Impact

Bank validation results affect the overall supplier risk score:

| Validation Result | Risk Impact |
|-------------------|-------------|
| All validations pass | +0 points (Low Risk) |
| Partial match (masked account) | +2 points (Low Risk) |
| Old document (3-6 months) | +10 points (Medium Risk) |
| Branch mismatch | +15 points (High Risk) |
| Account number mismatch | +25 points (High Risk) |
| Bank name mismatch | +30 points (Critical Risk) |
| No official markers | +20 points (High Risk) |
| Document older than 6 months | +25 points (High Risk) |

## Implementation Details

### **File**: `worker/crew_agents.py`
- **Function**: `analyze_document_with_ollama()`
- **Lines**: 195-260 (Bank validation prompt)

### **Form Fields Used**:
```python
{
  "companyName": str,       # Company/Business name
  "bankAccountName": str,   # Account holder name
  "bankName": str,          # Bank name (e.g., "FNB", "Standard Bank")
  "branchName": str,        # Branch location
  "branchNumber": str,      # Branch code
  "accountNumber": str,     # Bank account number
  "typeOfAccount": str      # Account type (e.g., "Cheque", "Savings")
}
```

### **Common South African Banks**:
- First National Bank (FNB)
- Standard Bank
- ABSA
- Nedbank
- Capitec
- Investec
- African Bank
- TymeBank
- Discovery Bank

## Validation Examples by Bank

### **FNB Example**
```
Expected elements:
- FNB letterhead/logo
- "First National Bank" text
- Branch code (6 digits)
- Account number format: XXXXXXXXXX
- Signature and stamp
```

### **Standard Bank Example**
```
Expected elements:
- Standard Bank logo
- "The Standard Bank of South Africa Limited"
- Branch code (6 digits)
- Account confirmation details
- Official bank stamp
```

## Security Considerations

### **High-Risk Indicators:**
- ❌ Account number completely different
- ❌ Bank name mismatch
- ❌ No official bank markers
- ❌ Document older than 6 months
- ❌ Missing signature/stamp

### **Medium-Risk Indicators:**
- ⚠️ Branch details different
- ⚠️ Document 3-6 months old
- ⚠️ Partially illegible

### **Low-Risk Indicators:**
- ✅ All details match
- ✅ Recent document (<3 months)
- ✅ Official markers present
- ✅ Clear and complete

## Integration with Overall Analysis

The bank validation feeds into the comprehensive analysis:

```
📊 Document Analysis Results:
- Company Registration: PASS (CIPC validated)
- B-BBEE Certificate: PASS (Valid Level 2)
- Bank Confirmation: FAIL (Account number mismatch)

Overall Risk Score: 45/100 (Medium Risk)
Recommendation: REQUEST REVISION - banking details need clarification
```

## Technical Flow

```
Supplier submits form with banking details
      ↓
Uploads bank confirmation letter
      ↓
Procurement manager clicks "AI Insights"
      ↓
Frontend sends:
  - Bank letter (PDF/image)
  - Form data (bank name, branch, account #, etc.)
      ↓
Worker extracts text from letter (OCR)
      ↓
Ollama analyzes with specific prompts
      ↓
Performs 8 validation checks
      ↓
Compares each field with form data
      ↓
Returns structured validation results
      ↓
UI displays PASS/FAIL for each field
```

## Common Issues and Solutions

### **Issue**: Account number partially masked
**Solution**: AI will mark as PARTIAL MATCH if last 4 digits match

### **Issue**: Bank uses abbreviations (e.g., "STD BANK" vs "Standard Bank")
**Solution**: AI recognizes common variations

### **Issue**: Branch code format varies
**Solution**: AI extracts regardless of format (with/without spaces/hyphens)

### **Issue**: Multiple accounts listed
**Solution**: AI searches for matching account number

## Example Use Cases

### **Use Case 1: Perfect Match**
- All banking details match exactly
- Recent document (1 week old)
- Official stamp and signature present
- **Result**: Score 95/100, Recommendation: APPROVE

### **Use Case 2: Old Document**
- All details match
- Document is 4 months old
- **Result**: Score 70/100, Recommendation: REQUEST updated letter

### **Use Case 3: Wrong Account**
- Bank and branch match
- Account number is different
- **Result**: Score 25/100, Recommendation: REJECT (critical error)

### **Use Case 4: Fraudulent Attempt**
- No bank letterhead
- No official markers
- Details don't match
- **Result**: Score 5/100, Recommendation: REJECT (possible fraud)

## Validation Checklist

For procurement managers reviewing results:

✅ **Approve if**:
- All 6 data fields match ✅
- Document is authentic ✅
- Date is recent (<3 months) ✅

⚠️ **Request Clarification if**:
- Minor mismatches (abbreviations, formatting)
- Partial matches on masked fields
- Document 3-6 months old

❌ **Reject if**:
- Account number mismatch
- Bank name mismatch
- No official markers
- Document older than 6 months
- Multiple critical fields mismatch

## Compliance Notes

- Bank confirmation letters must be **not older than 3 months**
- Must be on **official bank letterhead**
- Must include **bank stamp/seal**
- Must show **complete banking details**
- Partially masked account numbers acceptable if last 4 digits match

## Future Enhancements

Planned improvements:
- [ ] Detect fake bank letterheads
- [ ] Validate bank branch codes against official list
- [ ] Check account name variations (Pty Ltd, (Pty) Ltd, etc.)
- [ ] Verify signature authenticity
- [ ] Cross-reference with tax clearance certificate banking details
- [ ] Alert if document appears photocopied/scanned multiple times

## Support

For bank validation issues:
1. Ensure letter is on official bank letterhead
2. Check all form fields are filled correctly
3. Verify document is clear and readable
4. Review AI extraction in logs
5. Manual verification if AI uncertain

