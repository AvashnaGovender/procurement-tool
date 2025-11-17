# CIPC Document Validation Guide

This guide explains how the AI system validates CIPC (Companies and Intellectual Property Commission) documents for South African supplier onboarding.

## Overview

The AI performs specific validations on Company Registration Documents to ensure authenticity and data accuracy by cross-referencing with supplier form submissions.

## Validation Process

### **When Analyzing Company Registration Documents:**

The AI receives:
1. **Document Content** - OCR-extracted text from the uploaded PDF/image
2. **Form Data** - Information the supplier entered in the onboarding form

### **Specific Validations Performed:**

#### **1. CIPC Document Verification** 🔍
- **Searches for**: Keyword "CIPC" in the document
- **Validates authenticity**: Looks for "Certificate issued by the Companies and Intellectual Property Commission"
- **Result**: 
  - ✅ **VALID CIPC DOCUMENT** if certificate text found
  - ❌ **NOT A VALID CIPC DOCUMENT** if missing

#### **2. Company Name Validation** 🏢
- **Extracts**: Company name from CIPC document
- **Compares with**: Form field `companyName`
- **Validation**: Checks if names match
- **Result**: 
  - ✅ **MATCH** - Names are identical or very similar
  - ❌ **MISMATCH** - Names don't match (details provided)

#### **3. Registration Number Validation** 🔢
- **Extracts**: Registration number from CIPC document
- **Compares with**: Form field `registrationNumber`
- **Validation**: Checks if numbers match exactly
- **Result**:
  - ✅ **MATCH** - Registration numbers are identical
  - ❌ **MISMATCH** - Numbers don't match (details provided)

#### **4. Address Validation** 📍
- **Extracts**: Physical address from CIPC document
- **Compares with**: Form field `physicalAddress`
- **Validation**: Checks if form address is included in or matches CIPC address
- **Result**:
  - ✅ **MATCH** - Addresses are identical
  - ⚠️ **PARTIAL MATCH** - Addresses similar (e.g., shorter version)
  - ❌ **MISMATCH** - Addresses don't match (details provided)

#### **5. Document Completeness** 📄
- Is the document clear and readable?
- Are all critical fields visible?
- Any missing or illegible information?

## Implementation Details

### **File Locations:**

**AI Analysis Logic**: `worker/crew_agents.py` (Lines 70-150)
```python
def analyze_document_with_ollama(
    document_text: str,
    document_type: str,
    supplier_name: str,
    form_data: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
```

**API Endpoint**: `worker/main.py` (Lines 177-260)
```python
@app.post("/process-document")
async def process_document(request: dict):
```

**Frontend Integration**: `app/admin/supplier-submissions/[supplierId]/page.tsx` (Lines 369-384)

### **Form Data Fields Used:**

```typescript
{
  companyName: string,        // Used to validate against CIPC
  registrationNumber: string, // Used to validate against CIPC
  physicalAddress: string,    // Used to validate against CIPC
  contactEmail: string,       // For reference
  contactPerson: string       // For reference
}
```

## Expected Ollama Responses

### **Example Analysis Output:**

```
CIPC DOCUMENT VERIFICATION: ✅ VALID CIPC DOCUMENT
- Found "CIPC" keyword in document
- Found "Certificate issued by the Companies and Intellectual Property Commission"

COMPANY NAME VALIDATION: ✅ MATCH
- CIPC Document: "ABC Manufacturing (Pty) Ltd"
- Form Data: "ABC Manufacturing (Pty) Ltd"
- Status: Names match exactly

REGISTRATION NUMBER VALIDATION: ✅ MATCH
- CIPC Document: "2024/123456/07"
- Form Data: "2024/123456/07"
- Status: Registration numbers match exactly

ADDRESS VALIDATION: ⚠️ PARTIAL MATCH
- CIPC Document: "123 Main Street, Johannesburg, Gauteng, 2001, South Africa"
- Form Data: "123 Main Street, Johannesburg, 2001"
- Status: Form address is included within CIPC address

DOCUMENT COMPLETENESS: ✅ PASS
- Document is clear and readable
- All critical fields are visible
- No missing information detected
```

### **Compliance Check Output:**

```
OVERALL COMPLIANCE: ✅ PASS

All validations passed:
1. ✅ Valid CIPC certificate
2. ✅ Company name matches
3. ✅ Registration number matches
4. ✅ Address validated
5. ✅ Document complete

RECOMMENDATION: Document is authentic and data is accurate. Approved for onboarding.
```

### **Risk Assessment Output:**

```
RISK LEVEL: LOW

Risk Factors:
- Document Authenticity: LOW RISK (Valid CIPC certificate)
- Data Accuracy: LOW RISK (All fields match)
- Document Quality: LOW RISK (Clear and complete)

OVERALL RISK SCORE: 15/100 (Lower is better)

RECOMMENDATION: Supplier documentation is in order. Proceed with approval.
```

## Validation Failure Examples

### **Example 1: Invalid CIPC Document**
```
CIPC DOCUMENT VERIFICATION: ❌ NOT A VALID CIPC DOCUMENT
- "CIPC" keyword not found
- Certificate text not present
- This may be a company profile or other document type

RISK: HIGH - Document authenticity cannot be verified
RECOMMENDATION: Request valid CIPC registration certificate
```

### **Example 2: Name Mismatch**
```
COMPANY NAME VALIDATION: ❌ MISMATCH
- CIPC Document: "ABC Manufacturing (Pty) Ltd"
- Form Data: "ABC Industries (Pty) Ltd"
- Status: Names do not match

RISK: HIGH - Company name discrepancy detected
RECOMMENDATION: Request revision - supplier must provide matching documentation
```

### **Example 3: Registration Number Mismatch**
```
REGISTRATION NUMBER VALIDATION: ❌ MISMATCH
- CIPC Document: "2024/123456/07"
- Form Data: "2024/654321/07"
- Status: Registration numbers do not match

RISK: HIGH - Critical data mismatch
RECOMMENDATION: REJECT - Possible fraudulent submission
```

## Integration with Risk Scoring

The CIPC validation results directly impact the overall risk assessment:

- **All validations PASS**: Base risk remains low
- **1 MISMATCH**: Risk level increases to MEDIUM (+15 points)
- **2+ MISMATCHES**: Risk level increases to HIGH (+30 points)
- **Invalid CIPC**: Automatic HIGH risk (+40 points)

## Technical Flow

```
Supplier fills form
      ↓
Uploads CIPC document
      ↓
Procurement manager reviews
      ↓
Clicks "AI Insights" → "Start AI Analysis"
      ↓
Frontend sends:
  - Document file
  - Form data (name, reg#, address)
      ↓
Worker extracts text (OCR)
      ↓
Ollama analyzes with specific prompts
      ↓
Performs 5 validation checks
      ↓
Returns structured results
      ↓
UI displays validation status
```

## How to Read Results

In the **AI Insights** tab summary:

### **Green Indicators** (✅):
- Valid CIPC document
- All data matches
- Low risk
- **Action**: Approve for onboarding

### **Yellow Indicators** (⚠️):
- Partial matches
- Minor concerns
- Medium risk
- **Action**: Request clarification

### **Red Indicators** (❌):
- Invalid document
- Data mismatches
- High risk
- **Action**: Request revision or reject

## Example Use Cases

### **Use Case 1: Perfect Match**
- Supplier submits valid CIPC
- All data matches exactly
- **Result**: Score 90+/100, Recommendation: APPROVE

### **Use Case 2: Typo in Form**
- CIPC shows "ABC (Pty) Ltd"
- Form shows "ABC Pty Ltd" (missing parentheses)
- **Result**: Score 75/100, Recommendation: REQUEST_REVISION (minor correction)

### **Use Case 3: Wrong Document**
- Supplier uploads company profile instead of CIPC
- No CIPC certificate text found
- **Result**: Score 30/100, Recommendation: REJECT (wrong document)

### **Use Case 4: Fraudulent Attempt**
- Names don't match
- Registration numbers don't match
- **Result**: Score 10/100, Recommendation: REJECT (possible fraud)

## Customization

To add more validation checks, update `worker/crew_agents.py`:

```python
# Add new validation in the CIPC prompt
6. DIRECTOR VALIDATION:
   - Extract directors from CIPC document
   - Compare with form data: "{directors}"
   - Result: MATCH or MISMATCH
```

## Monitoring

Check worker service logs for validation details:

```
INFO:main:Processing document with AI: abc-123, type: companyRegistration
INFO:main:Form data provided: True
INFO:main:Using direct Ollama (CrewAI not available)
INFO:main:Ollama analysis completed with mode: ollama_direct
```

## Support

For issues with CIPC validation:
1. Check document quality - ensure text is extractable
2. Verify form data is being passed correctly
3. Review Ollama's analysis output in the AI Insights logs
4. Check that Ollama server is running and responding

## Future Enhancements

Potential improvements:
- [ ] Add director name validation
- [ ] Validate CIPC issue date
- [ ] Check company status (active/dissolved)
- [ ] Validate share capital information
- [ ] Cross-reference with BBBEE certificate

