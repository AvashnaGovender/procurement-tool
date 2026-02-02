"""AI agents for document processing and compliance checking using Ollama."""
try:
    from langchain_ollama import ChatOllama
    OLLAMA_AVAILABLE = True
except ImportError:
    OLLAMA_AVAILABLE = False
    print("⚠️  langchain-ollama not available")
    class ChatOllama:
        def __init__(self, *args, **kwargs):
            pass

# CrewAI is optional - we can use Ollama directly
try:
    from crewai import Agent, Task, Crew, Process
    from crewai.tools import BaseTool
    CREWAI_AVAILABLE = True
except ImportError:
    CREWAI_AVAILABLE = False
    # Create dummy classes for when CrewAI is not available
    class Agent:
        def __init__(self, *args, **kwargs):
            pass
    class Task:
        def __init__(self, *args, **kwargs):
            pass
    class Crew:
        def __init__(self, *args, **kwargs):
            pass
        def kickoff(self, *args, **kwargs):
            return {"error": "CrewAI not available"}
    class Process:
        pass
    class BaseTool:
        def __init__(self, *args, **kwargs):
            pass

from typing import Dict, List, Any, Optional
from pydantic import BaseModel
import json
import logging
from config import settings

logger = logging.getLogger(__name__)

# Initialize Ollama LLM
llm = None
if OLLAMA_AVAILABLE:
    try:
        llm = ChatOllama(
            model=settings.ollama_model,
            base_url=settings.ollama_base_url,
            temperature=0.7,
        )
        print(f"✅ Ollama LLM initialized with model: {settings.ollama_model}")
        print(f"   Model: {settings.ollama_model}")
        print(f"   Base URL: {settings.ollama_base_url}")
        print(f"   Temperature: 0.7")
        print(f"   Mode: {'CrewAI Agents' if CREWAI_AVAILABLE else 'Direct Ollama'}")
    except Exception as e:
        print(f"⚠️  Warning: Could not initialize Ollama LLM: {e}")
        print(f"   Falling back to basic analysis mode")
        llm = None
else:
    print(f"⚠️  langchain-ollama not installed")
    print(f"   Install with: pip install langchain-ollama")

def is_ollama_available() -> bool:
    """Check if Ollama LLM is available (CrewAI is optional)."""
    available = llm is not None
    print(f"🔍 Ollama availability check: llm={llm is not None}, result={available}")
    return available

def analyze_document_with_ollama(
    document_text: str, 
    document_type: str, 
    supplier_name: str,
    form_data: Optional[Dict[str, Any]] = None,
    filename: str = ""
) -> Dict[str, Any]:
    """Analyze document using Ollama with specific validation checks."""
    if not llm:
        return {
            "analysis_results": "Basic validation - document received",
            "compliance_results": "Manual review required",
            "risk_assessment": "To be determined",
            "mode": "fallback"
        }
    
    try:
        # STEP 0: Check if we have actual content or just a placeholder
        has_actual_content = len(document_text.strip()) > 50 and not document_text.startswith("PDF document uploaded") and not document_text.startswith("Document content extracted from") and not document_text.startswith("Document uploaded")
        
        # STEP 1: First detect what type of document this actually is by analyzing content
        # If we don't have actual content, use filename as a hint
        content_preview = document_text[:2000] if has_actual_content else "Content extraction failed - using filename analysis"
        filename_hint = f"\nFILENAME: {filename}" if filename else ""
        
        detection_prompt = f"""You are a document type classifier. Analyze the following information to determine what type of document this is.
{filename_hint}
DOCUMENT CONTENT (first 2000 characters):
{content_preview}

Based on the content and filename, identify the document type. Look for:
- Bank statements, bank letters, or bank confirmation letters (look for bank names, account numbers, transactions, "bank statement", "confirmation letter")
- Company registration documents (look for "CIPC", "Companies and Intellectual Property Commission", "CM1", "CK1", "CK2", registration numbers)
- Tax clearance certificates (look for "SARS", "South African Revenue Service", "Tax Clearance", "Good Standing")
- BBBEE certificates (look for "B-BBEE", "Broad-Based Black Economic Empowerment", "Department: Trade, Industry and Competition")
- Other document types

Respond with ONLY the document type in this format:
ACTUAL_DOCUMENT_TYPE: [type]

Examples:
ACTUAL_DOCUMENT_TYPE: bank_statement
ACTUAL_DOCUMENT_TYPE: bank_confirmation_letter
ACTUAL_DOCUMENT_TYPE: company_registration
ACTUAL_DOCUMENT_TYPE: tax_clearance
ACTUAL_DOCUMENT_TYPE: bbbee_certificate
ACTUAL_DOCUMENT_TYPE: unknown

If you cannot determine the type, respond with: ACTUAL_DOCUMENT_TYPE: unknown"""

        # Always try filename fallback first if we don't have content, before calling LLM
        actual_document_type = "unknown"
        if not has_actual_content and filename:
            # Try to infer from common filename patterns FIRST (faster than LLM)
            filename_lower = filename.lower()
            if "bank" in filename_lower or "confirmation" in filename_lower:
                actual_document_type = "bank_confirmation_letter"
                print(f"🔍 [FILENAME FALLBACK] Detected document type from filename: {actual_document_type} (filename: {filename})")
            elif "registration" in filename_lower or "cipc" in filename_lower or "cm1" in filename_lower or "ck1" in filename_lower:
                actual_document_type = "company_registration"
                print(f"🔍 [FILENAME FALLBACK] Detected document type from filename: {actual_document_type} (filename: {filename})")
            elif "tax" in filename_lower or "sars" in filename_lower or "good_standing" in filename_lower:
                actual_document_type = "tax_clearance"
                print(f"🔍 [FILENAME FALLBACK] Detected document type from filename: {actual_document_type} (filename: {filename})")
            elif "bbbee" in filename_lower or "bee" in filename_lower:
                actual_document_type = "bbbee_certificate"
                print(f"🔍 [FILENAME FALLBACK] Detected document type from filename: {actual_document_type} (filename: {filename})")
        
        # If we still don't have a type and have content, try LLM detection
        if actual_document_type == "unknown" and has_actual_content:
            detection_result = llm.invoke(detection_prompt)
            detection_text = detection_result.content if hasattr(detection_result, 'content') else str(detection_result)
            
            # Extract the detected document type
            if "ACTUAL_DOCUMENT_TYPE:" in detection_text:
                actual_document_type = detection_text.split("ACTUAL_DOCUMENT_TYPE:")[1].strip().split("\n")[0].strip().lower()
                print(f"🔍 [LLM DETECTION] Detected document type: {actual_document_type}")
        
        print(f"🔍 [FINAL] Document type detection: expected='{document_type}', detected='{actual_document_type}', has_content={has_actual_content}, filename='{filename}'")
        
        # Normalize document type names for comparison
        def normalize_type(doc_type: str) -> str:
            doc_type = doc_type.lower().replace(" ", "_").replace("-", "_")
            if "bank" in doc_type and ("statement" in doc_type or "confirmation" in doc_type or "letter" in doc_type):
                return "bank_confirmation"
            elif "company" in doc_type and ("registration" in doc_type or "cipc" in doc_type):
                return "company_registration"
            elif "tax" in doc_type or "good_standing" in doc_type or "sars" in doc_type:
                return "tax_clearance"
            elif "bbbee" in doc_type or "bee" in doc_type:
                return "bbbee_accreditation"
            return doc_type
        
        normalized_expected = normalize_type(document_type)
        normalized_actual = normalize_type(actual_document_type)
        
        # Check for mismatch
        type_mismatch = False
        mismatch_warning = ""
        print(f"🔍 Comparing types: normalized_expected='{normalized_expected}', normalized_actual='{normalized_actual}'")
        if normalized_actual != "unknown" and normalized_expected != normalized_actual:
            type_mismatch = True
            mismatch_warning = f"\n⚠️ DOCUMENT TYPE MISMATCH DETECTED:\n"
            mismatch_warning += f"   Expected: {document_type}\n"
            mismatch_warning += f"   Actual: {actual_document_type}\n"
            mismatch_warning += f"   This document appears to be a {actual_document_type} but was uploaded as {document_type}.\n"
            mismatch_warning += f"   Please verify the correct document was uploaded.\n"
            print(f"⚠️ MISMATCH DETECTED! Expected: {document_type}, Actual: {actual_document_type}")
        else:
            print(f"✅ Document type matches or could not be determined")
        
        # Get form data for validation
        company_name = form_data.get('companyName', supplier_name) if form_data else supplier_name
        registration_number = form_data.get('registrationNumber', '') if form_data else ''
        physical_address = form_data.get('physicalAddress', '') if form_data else ''
        bbbee_status = form_data.get('bbbeeLevel', '') if form_data else ''
        
        # Banking information from form
        bank_name = form_data.get('bankName', '') if form_data else ''
        branch_name = form_data.get('branchName', '') if form_data else ''
        branch_number = form_data.get('branchNumber', '') if form_data else ''
        account_number = form_data.get('accountNumber', '') if form_data else ''
        account_type = form_data.get('typeOfAccount', '') if form_data else ''
        bank_account_name = form_data.get('bankAccountName', '') if form_data else ''
        
        # Special validation for Company Registration Documents (CIPC)
        if document_type.lower() in ['companyregistration', 'company_registration', 'company registration']:
            analysis_prompt = f"""You are a CIPC (Companies and Intellectual Property Commission) document validator for South African businesses.

FORM DATA PROVIDED BY SUPPLIER:
- Company Name: {company_name}
- Registration Number: {registration_number}
- Physical Address: {physical_address}

DOCUMENT CONTENT:
{document_text[:2000]}

PERFORM THESE SPECIFIC VALIDATIONS:

1. CIPC DOCUMENT VERIFICATION:
   - Search for keyword "CIPC" in the document
   - Look for "Certificate issued by the Companies and Intellectual Property Commission"
   - If found: Mark as "VALID CIPC DOCUMENT"
   - If not found: Mark as "NOT A VALID CIPC DOCUMENT"

2. COMPANY NAME VALIDATION:
   - Extract company name from CIPC document
   - Compare with form data: "{company_name}"
   - Result: MATCH or MISMATCH (provide details)

3. REGISTRATION NUMBER VALIDATION:
   - Extract registration number from CIPC document
   - Compare with form data: "{registration_number}"
   - Result: MATCH or MISMATCH (provide details)

4. ADDRESS VALIDATION:
   - Extract address from CIPC document
   - Compare with form data: "{physical_address}"
   - Check if form address is included/matches CIPC address
   - Result: MATCH, PARTIAL MATCH, or MISMATCH (provide details)

5. DOCUMENT COMPLETENESS:
   - Is the document clear and readable?
   - Are all critical fields visible?
   - Any missing or illegible information?

Provide a structured response with clear PASS/FAIL status for each validation."""
        
        elif document_type.lower() in ['bbbeeaccreditation', 'bbbee_accreditation', 'bbbee accreditation', 'bbbee']:
            # Special validation for BBBEE Certificate
            analysis_prompt = f"""You are a B-BBEE (Broad-Based Black Economic Empowerment) certificate validator for South African businesses.

FORM DATA PROVIDED BY SUPPLIER:
- Company Name: {company_name}
- B-BBEE Status Level: {bbbee_status}

DOCUMENT CONTENT:
{document_text[:2500]}

PERFORM THESE SPECIFIC VALIDATIONS:

1. B-BBEE CERTIFICATE VERIFICATION:
   - Search for "Department: Trade, Industry and Competition"
   - Search for "REPUBLIC OF SOUTH AFRICA"
   - Search for "B-BBEE CERTIFICATE" or "BEE CERTIFICATE"
   - If all found: Mark as "VALID B-BBEE CERTIFICATE"
   - If not found: Mark as "NOT A VALID B-BBEE CERTIFICATE"

2. BLACK OWNERSHIP PERCENTAGE:
   - Search for "Black Ownership" or "Black Ownership Percentage"
   - Extract the percentage value
   - Report the value found (e.g., "51.2%")
   - If not found: Mark as "NOT FOUND"

3. BLACK FEMALE PERCENTAGE:
   - Search for "Black Female" or "Black Female Percentage" or "Black Women"
   - Extract the percentage value
   - Report the value found (e.g., "30.5%")
   - If not found: Mark as "NOT FOUND"

4. B-BBEE STATUS LEVEL VALIDATION:
   - Search for "B-BBEE Status" or "BEE Level" or "Level" or "Status Level"
   - Extract the status level (e.g., "Level 1", "Level 2", etc.)
   - Compare with form data: "{bbbee_status}"
   - Result: MATCH or MISMATCH (provide details)

5. EXPIRY DATE VALIDATION:
   - Search for "Valid Until" or "Expiry Date" or "Valid To" or "Validity"
   - Extract the expiry date
   - Check if the certificate is still valid (not expired)
   - Calculate days until expiry
   - Result: VALID, EXPIRED, or EXPIRING SOON (provide date)

6. DOCUMENT COMPLETENESS:
   - Is the document clear and readable?
   - Are all critical fields visible?
   - Any missing or illegible information?

Provide a structured response with clear PASS/FAIL status for each validation. Include the extracted values."""
        
        elif document_type.lower() in ['bankconfirmation', 'bank_confirmation', 'bank confirmation', 'bank letter']:
            # Special validation for Bank Confirmation Letter
            analysis_prompt = f"""You are a bank document validator specializing in verifying South African bank confirmation letters.

FORM DATA PROVIDED BY SUPPLIER:
- Company Name: {company_name}
- Bank Account Name: {bank_account_name}
- Bank Name: {bank_name}
- Branch Name: {branch_name}
- Branch Code/Number: {branch_number}
- Account Number: {account_number}
- Account Type: {account_type}

DOCUMENT CONTENT:
{document_text[:2500]}

PERFORM THESE SPECIFIC VALIDATIONS:

1. COMPANY NAME VALIDATION:
   - Search for company name or account holder name in the letter
   - Extract the name found
   - Compare with form data: "{company_name}" or "{bank_account_name}"
   - Result: MATCH or MISMATCH (provide details)

2. BANK NAME VALIDATION:
   - Search for bank name (e.g., FNB, Standard Bank, ABSA, Nedbank, Capitec)
   - Extract the bank name found
   - Compare with form data: "{bank_name}"
   - Result: MATCH or MISMATCH (provide details)

3. BRANCH NAME VALIDATION:
   - Search for branch name or branch location
   - Extract the branch name found
   - Compare with form data: "{branch_name}"
   - Result: MATCH, PARTIAL MATCH, or MISMATCH (provide details)

4. BRANCH CODE VALIDATION:
   - Search for "Branch Code" or "Branch Number" or "Universal Branch Code"
   - Extract the code/number found
   - Compare with form data: "{branch_number}"
   - Result: MATCH or MISMATCH (provide details)

5. ACCOUNT NUMBER VALIDATION:
   - Search for "Account Number" or "Account No"
   - Extract the account number found (may be partially masked like ****1234)
   - Compare with form data: "{account_number}"
   - Result: MATCH, PARTIAL MATCH (if masked), or MISMATCH (provide details)

6. ACCOUNT TYPE VALIDATION:
   - Search for account type (e.g., "Cheque", "Current", "Savings", "Business")
   - Extract the account type found
   - Compare with form data: "{account_type}"
   - Result: MATCH or MISMATCH (provide details)

7. DOCUMENT AUTHENTICITY:
   - Check for bank letterhead or logo
   - Check for bank stamp or signature
   - Check for date (should be recent, not older than 3 months)
   - Result: AUTHENTIC or QUESTIONABLE

8. DOCUMENT COMPLETENESS:
   - Is the document clear and readable?
   - Are all critical fields visible?
   - Any missing or illegible information?

Provide a structured response with clear PASS/FAIL status for each validation. Include all extracted values."""
        
        elif document_type.lower() in ['taxclearance', 'tax_clearance', 'tax clearance', 'good standing', 'goodstanding']:
            # Special validation for Tax Clearance / Good Standing Certificate
            analysis_prompt = f"""You are a tax document validator specializing in South African Revenue Service (SARS) tax clearance and good standing certificates.

FORM DATA PROVIDED BY SUPPLIER:
- Company Name: {company_name}
- Physical Address: {physical_address}

DOCUMENT CONTENT:
{document_text[:2500]}

PERFORM THESE SPECIFIC VALIDATIONS:

1. COMPANY NAME VALIDATION:
   - Search for company name in the document
   - Extract the company/business name found
   - Compare with form data: "{company_name}"
   - Result: MATCH or MISMATCH (provide details)

2. TAXPAYER NAME VALIDATION:
   - Search for "Taxpayer Name" or "Name of Taxpayer" or "Entity Name"
   - Extract the taxpayer name found
   - Compare with form data: "{company_name}"
   - The taxpayer name MUST match the company name
   - Result: MATCH or MISMATCH (provide details)

3. ADDRESS VALIDATION:
   - Search for physical address or registered address in the document
   - Extract the address found
   - Compare with form data: "{physical_address}"
   - Result: MATCH, PARTIAL MATCH, or MISMATCH (provide details)

4. PURPOSE OF REQUEST VALIDATION:
   - Search for "Purpose" or "Purpose of Request" or "Requested For"
   - Extract the purpose stated
   - Check if it says "Good Standing" or "Tax Compliance" or "Tax Clearance"
   - Result: CORRECT PURPOSE or INCORRECT PURPOSE (provide details)

5. TAX REFERENCE NUMBER:
   - Search for "Tax Reference Number" or "Tax Number" or "Income Tax Number"
   - Extract the tax reference number if present
   - Report the value found

6. VALIDITY/EXPIRY CHECK:
   - Search for "Valid Until" or "Expiry Date" or "Valid To" or "Issue Date"
   - Extract the validity date
   - Check if the certificate is still valid
   - Tax clearance should not be older than 3 months
   - Result: VALID, EXPIRED, or EXPIRING SOON

7. SARS/GOVERNMENT AUTHENTICITY:
   - Check for SARS logo or letterhead
   - Check for "South African Revenue Service"
   - Check for official stamps or reference numbers
   - Result: AUTHENTIC or QUESTIONABLE

8. DOCUMENT COMPLETENESS:
   - Is the document clear and readable?
   - Are all critical fields visible?
   - Any missing or illegible information?

Provide a structured response with clear PASS/FAIL status for each validation. Include all extracted values."""
        
        elif document_type.lower() in ['companyprofile', 'company_profile', 'company profile', 'organogram', 'organigramme']:
            # Optional documents - just confirm presence and basic info
            analysis_prompt = f"""You are reviewing optional supporting documents for supplier onboarding.

Document Type: {document_type}
Supplier: {supplier_name}
Company Name (from form): {company_name}

DOCUMENT CONTENT:
{document_text[:1500]}

This is an OPTIONAL document. Perform basic analysis:

1. DOCUMENT TYPE CONFIRMATION:
   - Confirm this is a {document_type}
   - Result: CONFIRMED or INCORRECT DOCUMENT TYPE

2. COMPANY NAME CHECK:
   - Look for company name in the document
   - Check if it matches: "{company_name}"
   - Result: MATCH, PARTIAL MATCH, or NOT FOUND

3. CONTENT QUALITY:
   - Is the document clear and readable?
   - Does it provide useful information about the company?
   - Result: GOOD QUALITY or POOR QUALITY

4. KEY INFORMATION (if Company Profile):
   - Business overview
   - Products/services
   - Company history
   - Notable achievements

5. KEY INFORMATION (if Organogram):
   - Company structure visible?
   - Key personnel identified?
   - Reporting lines clear?

Note: This is a SUPPORTING DOCUMENT (not mandatory). Presence is a plus, absence is acceptable.

Provide a brief assessment."""
        
        else:
            # Standard document analysis for other document types
            analysis_prompt = f"""You are a document analysis specialist reviewing supplier onboarding documents.

Document Type: {document_type}
Supplier: {supplier_name}
Company Name (from form): {company_name}
Document Content Preview: {document_text[:1000]}

Analyze this document and provide:
1. Key information extracted (company details, registration numbers, dates, etc.)
2. Document quality assessment
3. Any concerns or missing information
4. Compliance status
5. Check if company name appears in document and matches form

If this is a financial or official document:
- Check for company name match
- Look for validity dates
- Verify document authenticity markers
- Check for official stamps/signatures

Provide a structured analysis."""

        analysis_result = llm.invoke(analysis_prompt)
        analysis_text = analysis_result.content if hasattr(analysis_result, 'content') else str(analysis_result)
        
        # Prepend mismatch warning if detected - make it VERY prominent
        if type_mismatch:
            # Put mismatch warning at the very top, with clear markers
            analysis_text = "=" * 80 + "\n" + mismatch_warning + "\n" + "=" * 80 + "\n\n" + analysis_text
            print(f"✅ Mismatch warning prepended to analysis results (length: {len(analysis_text)})")
        
        # Create compliance check prompt
        compliance_prompt = f"""Based on this document analysis:

{analysis_text}

Check compliance for South African business requirements:
1. Is the document valid and complete?
2. Are all required fields present?
3. Does it meet regulatory standards?
4. Any red flags or concerns?

Provide compliance status and recommendations."""

        compliance_result = llm.invoke(compliance_prompt)
        compliance_text = compliance_result.content if hasattr(compliance_result, 'content') else str(compliance_result)
        
        # Create risk assessment prompt
        risk_prompt = f"""Based on this analysis:

Document Analysis: {analysis_text}
Compliance Check: {compliance_text}

Assess the risk level:
1. Document completeness risk
2. Compliance risk
3. Business risk indicators
4. Overall risk score (Low/Medium/High)

Provide risk assessment."""

        risk_result = llm.invoke(risk_prompt)
        risk_text = risk_result.content if hasattr(risk_result, 'content') else str(risk_result)
        
        return {
            "analysis_results": analysis_text,
            "compliance_results": compliance_text,
            "risk_assessment": risk_text,
            "mode": "ollama_direct",
            "document_type_detected": actual_document_type,
            "document_type_mismatch": type_mismatch
        }
    except Exception as e:
        print(f"Error in Ollama analysis: {e}")
        # Still return mismatch info even if analysis fails
        # The mismatch detection happens before the LLM call, so it's still valid
        error_result = {
            "analysis_results": f"Analysis attempted but encountered error: {str(e)}",
            "compliance_results": "Manual review required",
            "risk_assessment": "To be determined",
            "mode": "error"
        }
        
        # Include mismatch info if it was detected before the error
        if 'type_mismatch' in locals() and type_mismatch:
            error_result["document_type_mismatch"] = type_mismatch
            error_result["document_type_detected"] = actual_document_type if 'actual_document_type' in locals() else "unknown"
            # Prepend mismatch warning to error message
            if 'mismatch_warning' in locals():
                error_result["analysis_results"] = "=" * 80 + "\n" + mismatch_warning + "\n" + "=" * 80 + "\n\n" + error_result["analysis_results"]
                print(f"✅ Mismatch info preserved despite analysis error")
        
        return error_result


class DocumentAnalysisTool(BaseTool):
    """Tool for analyzing document content."""
    name: str = "document_analyzer"
    description: str = "Analyzes document content and extracts relevant information"
    
    def _run(self, document_text: str, document_type: str) -> str:
        """Analyze document and return structured information."""
        # This would integrate with your OCR extractor
        return f"Analyzed {document_type} document with {len(document_text)} characters"


class ComplianceCheckerTool(BaseTool):
    """Tool for checking compliance requirements."""
    name: str = "compliance_checker"
    description: str = "Checks documents against compliance requirements"
    
    def _run(self, document_data: Dict[str, Any], requirements: List[str]) -> str:
        """Check compliance and return results."""
        # This would implement actual compliance checking logic
        return f"Compliance check completed for {len(requirements)} requirements"


class RiskAssessmentTool(BaseTool):
    """Tool for risk assessment."""
    name: str = "risk_assessor"
    description: str = "Assesses risk based on document analysis and compliance"
    
    def _run(self, analysis_data: Dict[str, Any]) -> str:
        """Assess risk and return score."""
        # This would implement risk scoring logic
        return "Risk assessment completed"


# Define the agents with Ollama LLM
document_analyzer = Agent(
    role="Document Analysis Specialist",
    goal="Extract and analyze all relevant information from supplier documents",
    backstory="""You are an expert document analyst with years of experience in 
    processing supplier onboarding documents. You excel at extracting key information 
    from various document types including registration certificates, tax documents, 
    and compliance forms.""",
    tools=[DocumentAnalysisTool()],
    llm=llm,
    verbose=True,
    allow_delegation=False
)

compliance_officer = Agent(
    role="Compliance Officer",
    goal="Ensure all documents meet regulatory and company compliance requirements",
    backstory="""You are a compliance officer with deep knowledge of South African 
    business regulations, BBBEE requirements, tax compliance, and company policies. 
    You ensure all supplier documents meet the necessary standards.""",
    tools=[ComplianceCheckerTool()],
    llm=llm,
    verbose=True,
    allow_delegation=False
)

risk_assessor = Agent(
    role="Risk Assessment Specialist",
    goal="Evaluate supplier risk based on document analysis and compliance status",
    backstory="""You are a risk assessment specialist who evaluates supplier 
    applications based on document completeness, compliance status, and business 
    risk factors. You provide objective risk scores and recommendations.""",
    tools=[RiskAssessmentTool()],
    llm=llm,
    verbose=True,
    allow_delegation=False
)

decision_maker = Agent(
    role="Decision Maker",
    goal="Generate final decision summary and recommendations",
    backstory="""You are a senior procurement manager who makes final decisions 
    on supplier applications based on analysis, compliance status, and risk assessment. 
    You provide clear, actionable recommendations.""",
    tools=[],
    llm=llm,
    verbose=True,
    allow_delegation=False
)


def create_document_analysis_task(submission_id: str, documents: List[Dict[str, Any]]) -> Task:
    """Create task for document analysis."""
    return Task(
        description=f"""
        Analyze the following supplier documents for submission {submission_id}:
        
        Documents to analyze:
        {json.dumps(documents, indent=2)}
        
        For each document, extract:
        1. Document type and purpose
        2. Key information (company details, registration numbers, etc.)
        3. Completeness and quality
        4. Any missing or unclear information
        
        Focus on MANDATORY South African business documents:
        - CIPC Certificate: Company name, registration number, physical address, entity type
        - B-BBEE Certificate: Status level, black ownership %, black female %, validity/expiry date
        - Tax Clearance Certificate: Taxpayer name, tax reference number, purpose (Good Standing), validity (< 3 months old)
        - Bank Confirmation Letter: Bank name, branch details, account number, account type, account holder name
        
        CONDITIONAL documents (may or may not be required):
        - NDA: Required for SHARED_IP purchase types only - verify signatures and initials
        - Credit Application Form: Required for account payment terms (not required for COD)
        
        OPTIONAL documents (not required, but analyze if present):
        - VAT Registration Certificate
        - Company Profile, Organogram
        - Quality Management Certifications (ISO 9001, etc.)
        - Safety, Health and Environment (SHE) Certifications
        
        Provide a structured analysis of each document with specific extracted data.
        """,
        agent=document_analyzer,
        expected_output="Structured analysis of each document with extracted information and quality assessment"
    )


def create_compliance_check_task(submission_id: str, analysis_results: str) -> Task:
    """Create task for compliance checking."""
    return Task(
        description=f"""
        Based on the document analysis results for submission {submission_id}:
        
        {analysis_results}
        
        Check compliance against the following MANDATORY requirements for ALL suppliers:
        1. CIPC Certificate (Company Registration) - Verify company name, registration number, address
        2. B-BBEE Scorecard or Affidavit - Verify status level, black ownership %, validity
        3. Tax Clearance Certificate - Verify taxpayer name matches, good standing status, validity (< 3 months)
        4. Bank Confirmation Letter - Verify bank details, account number, branch information
        
        CONDITIONAL requirements (depending on purchase type and payment method):
        5. Non-Disclosure Agreement (NDA) - Required for SHARED_IP purchase type only (verify signatures on all pages)
        6. Credit Application Form - Required for account payment terms (NOT required for COD)
        
        OPTIONAL documents (not required, but beneficial if present):
        - VAT Registration Certificate
        - Company Profile
        - Organogram
        - Quality Management Certifications (ISO, etc.)
        - Safety, Health and Environment (SHE) Certifications
        
        For each MANDATORY requirement, indicate:
        - Status: PASSED, FAILED, or WARNING
        - Details: Specific findings
        - Recommendations: What needs to be done
        
        NOTE: Do NOT flag missing optional documents as compliance failures.
        """,
        agent=compliance_officer,
        expected_output="Detailed compliance check results with status for each MANDATORY requirement"
    )


def create_risk_assessment_task(submission_id: str, compliance_results: str) -> Task:
    """Create task for risk assessment."""
    return Task(
        description=f"""
        Based on the compliance check results for submission {submission_id}:
        
        {compliance_results}
        
        Assess the overall risk level considering:
        1. Document completeness and quality
        2. Compliance status
        3. Business type and sector
        4. Financial stability indicators
        5. Previous supplier history (if any)
        
        Provide:
        - Overall risk score (0-100, where 0 is no risk, 100 is high risk)
        - Risk factors identified
        - Risk mitigation recommendations
        """,
        agent=risk_assessor,
        expected_output="Risk assessment with score, factors, and recommendations"
    )


def create_decision_summary_task(submission_id: str, analysis_results: str, compliance_results: str, risk_assessment: str) -> Task:
    """Create task for final decision summary."""
    return Task(
        description=f"""
        Based on all analysis for submission {submission_id}:
        
        Document Analysis:
        {analysis_results}
        
        Compliance Check:
        {compliance_results}
        
        Risk Assessment:
        {risk_assessment}
        
        Generate a final decision summary including:
        1. Overall recommendation (APPROVE, REJECT, or REQUEST_REVISION)
        2. Key findings summary
        3. Specific issues that need attention
        4. Next steps for the supplier
        5. Admin action items
        """,
        agent=decision_maker,
        expected_output="Final decision summary with recommendation and action items"
    )


def create_processing_crew(submission_id: str, documents: List[Dict[str, Any]]) -> Crew:
    """Create a crew to process supplier submission."""
    
    # Create tasks
    analysis_task = create_document_analysis_task(submission_id, documents)
    compliance_task = create_compliance_check_task(submission_id, "{{analysis_task.output}}")
    risk_task = create_risk_assessment_task(submission_id, "{{compliance_task.output}}")
    decision_task = create_decision_summary_task(
        submission_id, 
        "{{analysis_task.output}}", 
        "{{compliance_task.output}}", 
        "{{risk_task.output}}"
    )
    
    # Create crew
    crew = Crew(
        agents=[document_analyzer, compliance_officer, risk_assessor, decision_maker],
        tasks=[analysis_task, compliance_task, risk_task, decision_task],
        process=Process.sequential,
        verbose=True
    )
    
    return crew

